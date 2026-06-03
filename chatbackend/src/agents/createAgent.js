const { StreamChat } = require("stream-chat");
const { apiKey, serverClient } = require("../serverClient");
const { OpenAIAgent } = require("./openai/OpenAiAgent");
const { AgentPlatform } = require("./types");

const createAgent = async (
    user_id,
    platform,
    channel_type,
    channel_id
) => {
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

module.exports = {
    createAgent,
};
