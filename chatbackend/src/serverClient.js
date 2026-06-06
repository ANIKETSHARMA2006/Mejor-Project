const { StreamChat } = require("stream-chat");

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    throw new Error(
        "Missing required environment variables STREAM_API_KEY or STREAM_API_SECRET"
    );
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret, { timeout: 60000 });

module.exports = {
    apiKey,
    apiSecret,
    serverClient,
};
