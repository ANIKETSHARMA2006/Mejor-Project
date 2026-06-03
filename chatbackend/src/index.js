const cors = require("cors");
require("dotenv/config");
const express = require("express");
const { createAgent } = require("./agents/createAgent");
const { AgentPlatform } = require("./agents/types");
const { apiKey, serverClient } = require("./serverClient");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

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
    res.json({
        message: "AI Writing Assistant Server is running",
        apiKey: apiKey,
        activeAgents: aiAgentCache.size,
    });
});

/**
 * Handle the request to start the AI Agent
 */
app.post("/start-ai-agent", async (req, res) => {
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
                AgentPlatform.OPENAI,
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
app.post("/stop-ai-agent", async (req, res) => {
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

app.get("/agent-status", (req, res) => {
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
app.post("/token", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: "userId is required",
            });
        }

        // Create token with expiration (1 hour) and issued at time for security
        const issuedAt = Math.floor(Date.now() / 1000);
        const expiration = issuedAt + 60 * 60; // 1 hour from now

        const token = serverClient.createToken(userId, expiration, issuedAt);

        res.json({ token });
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
