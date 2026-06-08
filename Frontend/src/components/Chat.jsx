import React, { useRef, useState, useEffect } from 'react'
import Header from './Header'
import StarsBackground from './Stars'
import Input from './Input'
import Chatsection, { defaultMessages } from './Chatsection'
import Open from './Open'
import { StreamChat } from 'stream-chat'
import axios from 'axios'

const apiKey = import.meta.env.VITE_STREAM_API_KEY || "YOUR_STREAM_API_KEY";

const Chat = () => {

  const inputRef = useRef(null);
  const [messages, setMessages] = useState(defaultMessages);
  const [channel, setChannel] = useState(null);
  const [client, setClient] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let chatClient = null;

    const initChat = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://mejor-backend.onrender.com');

        // Fetch token from backend using session cookie
        const response = await axios.post(`${API_BASE_URL}/token`, {}, { withCredentials: true });
        const { token, userId } = response.data;

        // Initialize Stream Client
        chatClient = StreamChat.getInstance(apiKey);
        await chatClient.connectUser({ id: userId, name: userId }, token);
        setClient(chatClient);

        // Create a unique channel for this user and the AI, starting fresh if page is closed
        let sessionId = sessionStorage.getItem('chat_session_id');
        if (!sessionId) {
            sessionId = Date.now().toString();
            sessionStorage.setItem('chat_session_id', sessionId);
        }
        const channelId = `react-chat-${userId}-${sessionId}`;
        const newChannel = chatClient.channel('messaging', channelId, {
          name: 'AI Companion Chat'
        });
        
        await newChannel.watch();
        setChannel(newChannel);

        // Load existing messages if any
        if (newChannel.state.messages.length > 0) {
           const history = newChannel.state.messages.map(msg => ({
             id: msg.id,
             role: msg.user.id.startsWith('ai-bot') ? 'assistant' : 'user',
             text: msg.text
           }));
           setMessages(history);
        }

        // We can show the UI immediately after channel is watched
        setIsCheckingAuth(false);

        // Start AI agent on backend in the background (no await)
        axios.post(`${API_BASE_URL}/start-ai-agent`, { channel_id: channelId }, { withCredentials: true })
             .catch(err => console.error("Error starting AI agent:", err));

        // Listen for new messages
        newChannel.on('message.new', event => {
          // Forcefully block the annoying OpenAI built-in error message
          if (event.message.text && event.message.text.includes("exceeded your current quota")) {
             return;
          }

          setMessages(prev => {
             // Avoid duplicating user's optimistic messages
             if (prev.find(m => m.id === event.message.id)) return prev;
             
             return [...prev, {
                id: event.message.id,
                role: event.message.user.id.startsWith('ai-bot') ? 'assistant' : 'user',
                text: event.message.text
             }];
          });
        });

        // Listen for message updates (critical for streaming AI responses)
        newChannel.on('message.updated', event => {
          setMessages(prev => prev.map(m => 
            m.id === event.message.id 
              ? { ...m, text: event.message.text }
              : m
          ));
        });

      } catch (error) {
        console.error("Failed to initialize chat:", error);
        if (error.response && error.response.status === 401) {
          window.location.href = 'https://mejor-backend.onrender.com/login';
        } else {
          setIsCheckingAuth(false);
        }
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const text = inputRef.current?.value.trim();
    if (!text || !channel) return;

    // Optimistically add user message
    const tempId = `${Date.now()}-user`;
    const userMessage = {
      id: tempId,
      role: "user",
      text,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    inputRef.current.value = "";

    try {
      // Send message to Stream with the pre-generated ID
      await channel.sendMessage({ 
          id: tempId,
          text: text 
      });
      
      // Update is handled automatically by the message.new listener since the ID matches!
    } catch (err) {
      console.error("Error sending message", err);
    }
  }

  if (isCheckingAuth) {
    return (
      <div className='w-full h-screen flex justify-center items-center bg-black text-white'>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative z-0 w-full h-screen flex justify-center items-center flex-col overflow-hidden'>
      <div className='absolute z-[-1] w-72 h-72 md:w-175 md:h-145 pointer-events-none bg-purple-700/30 rounded-full blur-[100px] md:blur-[140px] top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow'></div>
      <StarsBackground />
      <Header />
      {messages.length>0?<Chatsection messages={messages} />:<Open inputRef={inputRef} username={client?.user?.id} />}
      <Input inputRef={inputRef} handleSubmit={handleSubmit} />
    </div>
  )
}

export default Chat
