import React from 'react'
import Header from './Header'
import StarsBackground from './Stars'

const Chat = () => {
  return (
    <div className='w-full h-screen '>
      <div className='absolute w-170 h-170 pointer-events-none bg-purple-700/30  rounded-full blur-[140px] top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow"'></div>
      <StarsBackground/>
      <Header/>
    </div>
  )
}

export default Chat
