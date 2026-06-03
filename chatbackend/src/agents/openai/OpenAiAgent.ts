import OpenAI from "openai";
import type { Channel, Event, Message, StreamChat } from "stream-chat";
import type { AIAgent } from "../types";
import { OpenAIResponseHandler } from "./OpenAIResponseHandler";

type AiMessage = Message & {
    ai_generated?: boolean;
    custom?: {
        writingTask?: string;
    };
};

export class OpenAIAgent implements AIAgent {
    private openai?: OpenAI;
    private assistant?: OpenAI.Beta.Assistants.Assistant;
    private openAiThread?: OpenAI.Beta.Threads.Thread;
    private lastInteractionTs = Date.now();

    private handlers: OpenAIResponseHandler[] = [];

    constructor(
        readonly chatClient: StreamChat,
        readonly channel: Channel
    ) { }

    dispose = async () => {
        this.chatClient.off("message.new", this.handleMessage);
        await this.chatClient.disconnectUser();

        this.handlers.forEach((handler) => handler.dispose());
        this.handlers = [];
    };

    get user() {
        return this.chatClient.user;
    }

    getLastInteraction = (): number => this.lastInteractionTs;

    init = async () => {
        const apiKey = process.env.OPENAI_API_KEY as string | undefined;
        if (!apiKey) {
            throw new Error("OpenAI API key is required");
        }

        this.openai = new OpenAI({ apiKey });
        this.assistant = await this.openai.beta.assistants.create({
            name: "AI Writing Assistant",
            instructions: this.getWritingAssistantPrompt(),
            model: "gpt-4o",
            tools: [
                { type: "code_interpreter" },
                {
                    type: "function",
                    function: {
                        name: "web_search",
                        description:
                            "Search the web for current information, news, facts, or research on any topic",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query to find information about",
                                },
                            },
                            required: ["query"],
                        },
                    },
                },
            ],
            temperature: 0.7,
        });
        this.openAiThread = await this.openai.beta.threads.create();

        this.chatClient.on("message.new", this.handleMessage);
    };

    private getWritingAssistantPrompt = (context?: string): string => {
        const currentDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        return `You are an expert AI Writing Assistant. Your primary purpose is to be a collaborative writing partner.

**Your Core Capabilities:**
- Content Creation, Improvement, Style Adaptation, Brainstorming, and Writing Coaching.
- **Web Search**: You have the ability to search the web for up-to-date information using the 'web_search' tool.
- **Current Date**: Today's date is ${currentDate}. Please use this for any time-sensitive queries.

**Crucial Instructions:**
1.  **ALWAYS use the 'web_search' tool when the user asks for current information, news, or facts.** Your internal knowledge is outdated.
2.  When you use the 'web_search' tool, you will receive a JSON object with search results. **You MUST base your response on the information provided in that search result.** Do not rely on your pre-existing knowledge for topics that require current information.
3.  Synthesize the information from the web search to provide a comprehensive and accurate answer. Cite sources if the results include URLs.

**Response Format:**
- Be direct and production-ready.
- Use clear formatting.
- Never begin responses with phrases like "Here's the edit:", "Here are the changes:", or similar introductory statements.
- Provide responses directly and professionally without unnecessary preambles.

**Writing Context**: ${context || "General writing assistance."}

Your goal is to provide accurate, current, and helpful written content. Failure to use web search for recent topics will result in an incorrect answer.`;
    };

    private handleMessage = async (e: Event) => {
        if (!this.openai || !this.openAiThread || !this.assistant) {
            console.log("OpenAI not initialized");
            return;
        }

        const eventMessage = e.message as AiMessage | undefined;

        if (!eventMessage || eventMessage.ai_generated) {
            return;
        }

        const message = eventMessage.text;
        if (!message) return;

        this.lastInteractionTs = Date.now();

        const writingTask = eventMessage.custom?.writingTask;
        const context = writingTask ? `Writing Task: ${writingTask}` : undefined;
        const instructions = this.getWritingAssistantPrompt(context);

        await this.openai.beta.threads.messages.create(this.openAiThread.id, {
            role: "user",
            content: message,
        });

        const { message: channelMessage } = await this.channel.sendMessage({
            text: "",
            ai_generated: true,
        } as AiMessage);

        await this.channel.sendEvent({
            type: "ai_indicator.update",
            ai_state: "AI_STATE_THINKING",
            cid: channelMessage.cid,
            message_id: channelMessage.id,
        });

        const run = this.openai.beta.threads.runs.createAndStream(
            this.openAiThread.id,
            {
                assistant_id: this.assistant.id,
            }
        );

        const handler = new OpenAIResponseHandler(
            this.openai,
            this.openAiThread,
            run,
            this.chatClient,
            this.channel,
            channelMessage,
            () => this.removeHandler(handler)
        );
        this.handlers.push(handler);
        void handler.run();
    };

    private removeHandler = (handlerToRemove: OpenAIResponseHandler) => {
        this.handlers = this.handlers.filter(
            (handler) => handler !== handlerToRemove
        );
    };
}
