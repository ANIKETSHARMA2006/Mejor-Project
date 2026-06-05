import React from 'react'
import Header from './Header'
import StarsBackground from './Stars'
import Open from './Open'
import Input from './Input'

const Chat = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center flex-col'>
      <div className='absolute w-175 h-145 pointer-events-none bg-purple-700/30 rounded-full blur-[140px] top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow'></div>
      <StarsBackground />
      <Header />
      <Open />
      <Input />
    </div>
  )
}

export default Chat