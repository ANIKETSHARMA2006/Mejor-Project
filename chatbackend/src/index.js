const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv/config");
const express = require("express");
const path = require("path");
const { createAgent } = require("./agents/createAgent");
const { AgentPlatform } = require("./agents/types");
const {
    attachUser,
    clearSessionCookie,
    loginOrCreateUser,
    requireApiAuth,
    requirePageAuth,
    setSessionCookie,
} = require("./auth");
const { apiKey, serverClient } = require("./serverClient");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: function (origin, callback) {
        callback(null, origin || true);
    },
    credentials: true
}));
app.use(cookieParser());
app.use(attachUser);

app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

// Map to store the AI Agent instances
// [user_id string]: AI Agent
const aiAgentCache = new Map();
const pendingAiAgents = new Set();

// TODO: temporary set to 8 hours, should be cleaned up at some point
const inactivityThreshold = 480 * 60 * 1000;
// Periodically check for inactive AI agents and dispose of them
setInterval(async () => {
    const now = Date.now();
    for (const [userId, aiAgent] of aiAgentCache) {
        if (now - aiAgent.getLastInteraction() > inactivityThreshold) {
            console.log(`Disposing AI Agent due to inactivity: ${userId}`);
            await disposeAiAgent(aiAgent);
            aiAgentCache.delete(userId);
        }
    }
}, 5000);

app.get("/", (req, res) => {
    res.redirect(req.user ? "https://mejor-project-livid.vercel.app/" : "/login");
});

app.get("/login", (req, res) => {
    if (req.user) {
        res.redirect("https://mejor-project-livid.vercel.app/");
        return;
    }
    res.render("login", { error: "", username: "" });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await loginOrCreateUser(username, password);
        setSessionCookie(res, user.id);
        res.redirect("https://mejor-project-livid.vercel.app/");
    } catch (error) {
        res.status(401).render("login", {
            error: error.message,
            username,
        });
    }
});

app.get("/logout", (req, res) => {
    clearSessionCookie(res);
    res.redirect("/login");
});

app.get("/app", requirePageAuth, (req, res) => {
    res.render("app", { user: req.user });
});

app.get("/health", (req, res) => {
    res.json({
        message: "AI Writing Assistant Server is running",
        apiKey: apiKey,
        activeAgents: aiAgentCache.size,
    });
});

/**
 * Handle the request to start the AI Agent
 */
app.post("/start-ai-agent", requireApiAuth, async (req, res) => {
    const { channel_id, channel_type = "messaging" } = req.body;
    console.log(`[API] /start-ai-agent called for channel: ${channel_id}`);

    // Simple validation
    if (!channel_id) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;

    try {
        // Prevent multiple agents from being created for the same channel simultaneously
        if (!aiAgentCache.has(user_id) && !pendingAiAgents.has(user_id)) {
            console.log(`[API] Creating new agent for ${user_id}`);
            pendingAiAgents.add(user_id);

            await serverClient.upsertUser({
                id: user_id,
                name: "AI Writing Assistant",
            });

            const channel = serverClient.channel(channel_type, channel_id);
            await channel.addMembers([user_id]);

            const agent = await createAgent(
                user_id,
                AgentPlatform.GEMINI,
                channel_type,
                channel_id
            );

            await agent.init();
            // Final check to prevent race conditions where an agent might have been added
            // while this one was initializing.
            if (aiAgentCache.has(user_id)) {
                await agent.dispose();
            } else {
                aiAgentCache.set(user_id, agent);
            }
        } else {
            console.log(`AI Agent ${user_id} already started or is pending.`);
        }

        res.json({ message: "AI Agent started", data: [] });
    } catch (error) {
        const errorMessage = error.message;
        console.error("Failed to start AI Agent", errorMessage);
        res
            .status(500)
            .json({ error: "Failed to start AI Agent", reason: errorMessage });
    } finally {
        pendingAiAgents.delete(user_id);
    }
});

/**
 * Handle the request to stop the AI Agent
 */
app.post("/stop-ai-agent", requireApiAuth, async (req, res) => {
    const { channel_id } = req.body;
    console.log(`[API] /stop-ai-agent called for channel: ${channel_id}`);
    const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;
    try {
        const aiAgent = aiAgentCache.get(user_id);
        if (aiAgent) {
            console.log(`[API] Disposing agent for ${user_id}`);
            await disposeAiAgent(aiAgent);
            aiAgentCache.delete(user_id);
        } else {
            console.log(`[API] Agent for ${user_id} not found in cache.`);
        }
        res.json({ message: "AI Agent stopped", data: [] });
    } catch (error) {
        const errorMessage = error.message;
        console.error("Failed to stop AI Agent", errorMessage);
        res
            .status(500)
            .json({ error: "Failed to stop AI Agent", reason: errorMessage });
    }
});

app.get("/agent-status", requireApiAuth, (req, res) => {
    const { channel_id } = req.query;
    if (!channel_id || typeof channel_id !== "string") {
        return res.status(400).json({ error: "Missing channel_id" });
    }
    const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;
    console.log(
        `[API] /agent-status called for channel: ${channel_id} (user: ${user_id})`
    );

    if (aiAgentCache.has(user_id)) {
        console.log(`[API] Status for ${user_id}: connected`);
        res.json({ status: "connected" });
    } else if (pendingAiAgents.has(user_id)) {
        console.log(`[API] Status for ${user_id}: connecting`);
        res.json({ status: "connecting" });
    } else {
        console.log(`[API] Status for ${user_id}: disconnected`);
        res.json({ status: "disconnected" });
    }
});

// Token provider endpoint - generates secure tokens
app.post("/token", requireApiAuth, async (req, res) => {
    try {
        // Create token with expiration (1 hour) and issued at time for security
        const issuedAt = Math.floor(Date.now() / 1000);
        const expiration = issuedAt + 60 * 60; // 1 hour from now

        const token = serverClient.createToken(req.user.id, expiration, issuedAt);

        res.json({ token, userId: req.user.id });
    } catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({
            error: "Failed to generate token",
        });
    }
});

async function disposeAiAgent(aiAgent) {
    await aiAgent.dispose();
    if (!aiAgent.user) {
        return;
    }
    await serverClient.deleteUser(aiAgent.user.id, {
        hard_delete: true,
    });
}

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
