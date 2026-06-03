import { StreamChat } from "stream-chat";
import { apiKey, serverClient } from "../serverClient";
import { OpenAIAgent } from "./openai/OpenAIAgent";
import { AgentPlatform, AIAgent } from "./types";

export const createAgent = async (
    user_id: string,
    platform: AgentPlatform,
    channel_type: string,
    channel_id: string
): Promise<AIAgent> => {
    const token = serverClient.createToken(user_id);
    // This is the client for the AI bot user
    const chatClient = new StreamChat(apiKey, undefined, {
        allowServerSideConnect: true,
    });

    await chatClient.connectUser({ id: user_id }, token);
    const channel = chatClient.channel(channel_type, channel_id);
    await channel.watch();

    switch (platform) {
        case AgentPlatform.WRITING_ASSISTANT:
        case AgentPlatform.OPENAI:
            return new OpenAIAgent(chatClient, channel);
        default:
            throw new Error(`Unsupported agent platform: ${platform}`);
    }
};
