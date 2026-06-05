import React, { useRef, useState } from 'react'
import Header from './Header'
import StarsBackground from './Stars'
import Input from './Input'
import Chatsection, { defaultMessages } from './Chatsection'
import Open from './Open'

const Chat = () => {

  const inputRef = useRef(null);
  const [messages, setMessages] = useState(defaultMessages);

  async function handleSubmit(e) {
  e.preventDefault();

  const text = inputRef.current?.value.trim();
  if (!text) return;

  const userMessage = {
    id: `${Date.now()}-user`,
    role: "user",
    text,
  };

  setMessages((prevMessages) => [...prevMessages, userMessage]);
  inputRef.current.value = "";

  //llm response
  const aiResponse = "Thinking ...";

  const assistantMessage = {
    id: `${Date.now()}-assistant`,
    role: "assistant",
    text: aiResponse,
  };

  setMessages((prevMessages) => [...prevMessages, assistantMessage]);
}

  return (
    <div className='relative z-0 w-full h-screen flex justify-center items-center flex-col'>
      <div className='absolute z-[-1] w-175 h-145 pointer-events-none bg-purple-700/30 rounded-full blur-[140px] top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow'></div>
      <StarsBackground />
      <Header />
      {messages.length>0?<Chatsection messages={messages} />:<Open inputRef={inputRef} />}
      <Input inputRef={inputRef} handleSubmit={handleSubmit} />
    </div>
  )
}

export default Chat
