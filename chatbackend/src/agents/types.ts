import type { Channel, StreamChat, User } from "stream-chat";

export interface AIAgent {
    user?: User;
    channel: Channel;
    chatClient: StreamChat;
    getLastInteraction: () => number;
    init: () => Promise<void>;
    dispose: () => Promise<void>;
}

export enum AgentPlatform {
    OPENAI = "openai",
    WRITING_ASSISTANT = "writing_assistant",
}

// Extended message type for writing assistant features
export interface WritingMessage {
    custom?: {
        messageType?: "user_input" | "ai_response" | "system_message";
        writingTask?: string;
        suggestions?: string[];
    };
}
