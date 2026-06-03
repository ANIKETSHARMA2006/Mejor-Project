import { StreamChat } from 'stream-chat';
export const apikey = process.env.STREAM_API_KEY;
export const apiSecret = process.env.STREAM_API_SECRET;
if (!apikey || !apiSecret) {
    throw new Error("Missing required environment variables for STREAM_API_KEY and STREAM_API_SECRET");
}
export const serverClient = new StreamChat(apikey, apiSecret);
