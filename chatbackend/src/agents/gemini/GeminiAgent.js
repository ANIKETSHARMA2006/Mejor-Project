const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GeminiResponseHandler } = require("./GeminiResponseHandler");

class GeminiAgent {
    constructor(chatClient, channel) {
        this.chatClient = chatClient;
        this.channel = channel;
        this.lastInteractionTs = Date.now();
        this.handlers = [];

        this.dispose = async () => {
            this.chatClient.off("message.new", this.handleMessage);
            await this.chatClient.disconnectUser();

            this.handlers.forEach((handler) => handler.dispose());
            this.handlers = [];
        };

        this.getLastInteraction = () => this.lastInteractionTs;

        this.init = async () => {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY is required in .env");
            }

            this.genAI = new GoogleGenerativeAI(apiKey);
            // We use the 1.5 flash model which is very fast and suitable for general chat
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            this.channel.on("message.new", this.handleMessage);

            // Check if there are any unreplied messages from the user
            // Check if there are any unreplied messages from the user
            try {
                const messages = this.channel.state?.messages || [];
                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    // If the last message is from a user, process it
                    if (!lastMessage.ai_generated && (!lastMessage.user || !lastMessage.user.id.startsWith('ai-bot'))) {
                        console.log(`[GeminiAgent] Processing pending message on init: ${lastMessage.text}`);
                        this.handleMessage({ message: lastMessage });
                    }
                }
            } catch (err) {
                console.error("Error checking for pending messages on init:", err);
            }
        };

        this.getSystemInstruction = (context) => {
            const currentDate = new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            return `You are an expert AI Writing Assistant. Your primary purpose is to be a collaborative writing partner.

**Your Core Capabilities:**
- Content Creation, Improvement, Style Adaptation, Brainstorming, and Writing Coaching.
- **Current Date**: Today's date is ${currentDate}. Please use this for any time-sensitive queries.

**Response Format:**
- Be direct and production-ready.
- Use clear formatting.
- **CRITICAL: Keep your responses concise and strictly under 4500 characters in length.**
- Never begin responses with phrases like "Here's the edit:", "Here are the changes:", or similar introductory statements.
- Provide responses directly and professionally without unnecessary preambles.
- **Behavior on Greetings:** If the user just says a simple greeting (like "hi", "hello", "hey"), respond with a very short, simple, and friendly greeting (e.g., "Hello! How can I help you today?"). Do not elaborate, do not mention past templates, and do not write long paragraphs.

**Writing Context**: ${context || "General writing assistance."}`;
        };

        this.handleMessage = async (e) => {
            if (!this.genAI || !this.model) {
                console.log("Gemini not initialized");
                return;
            }

            const eventMessage = e.message;

            if (!eventMessage || eventMessage.ai_generated) {
                return;
            }

            const message = eventMessage.text;
            if (!message) return;

            console.log(`[GeminiAgent] Received message from user: ${message}`);
            require('fs').appendFileSync('b:\\\\Coding\\\\WebMainProject\\\\Mejor-Project\\\\chatbackend\\\\debug.log', `[GeminiAgent] Received message: ${message}\\n`);
            this.lastInteractionTs = Date.now();

            const writingTask = eventMessage.custom?.writingTask;
            const context = writingTask ? `Writing Task: ${writingTask}` : undefined;
            const instructions = this.getSystemInstruction(context);

            try {
                // To maintain context, we fetch recent messages from the channel
                const messages = this.channel.state?.messages || [];
                
                // Convert stream chat history to Gemini history format
                const history = [];
                for (const msg of messages) {
                    if (msg.id === eventMessage.id) continue; // Skip the current message we are about to process
                    if (!msg.text) continue;

                    history.push({
                        role: msg.ai_generated || msg.user.id.startsWith('ai-bot') ? "model" : "user",
                        parts: [{ text: msg.text }],
                    });
                }

                // Add system instructions as the very first user message for context
                if (history.length === 0 || history[0].role !== "user") {
                    history.unshift({ role: "model", parts: [{ text: "Understood. I will act as the writing assistant." }] });
                    history.unshift({ role: "user", parts: [{ text: "System Instructions: " + instructions }] });
                }

                // Create the chat session
                const chat = this.model.startChat({
                    history: history,
                });

                // Send an empty AI message to show the UI loading state
                const { message: channelMessage } = await this.channel.sendMessage({
                    text: "",
                    ai_generated: true,
                    user_id: this.chatClient.user.id,
                });

                await this.channel.sendEvent({
                    type: "ai_indicator.update",
                    ai_state: "AI_STATE_THINKING",
                    cid: channelMessage.cid,
                    message_id: channelMessage.id,
                });

                // Send the new message to Gemini and stream the result
                const resultStream = await chat.sendMessageStream(message);

                const handler = new GeminiResponseHandler(
                    resultStream.stream,
                    this.chatClient,
                    this.channel,
                    channelMessage,
                    () => this.removeHandler(handler)
                );
                
                this.handlers.push(handler);
                void handler.run();

            } catch (error) {
                console.error("Failed to process message with Gemini:", error);
            }
        };

        this.removeHandler = (handlerToRemove) => {
            this.handlers = this.handlers.filter(
                (handler) => handler !== handlerToRemove
            );
        };
    }

    get user() {
        return this.chatClient.user;
    }
}

module.exports = {
    GeminiAgent,
};
