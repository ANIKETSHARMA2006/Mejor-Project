import React from "react";
import bot from "../assets/white-robo.svg";

export const defaultMessages = [];

import ReactMarkdown from 'react-markdown';

const Chatsection = ({ messages = defaultMessages }) => {
  return (
    <section className="w-312.5 mx-auto h-[74%] overflow-x-hidden border-x border-[#4c4c4c] bg-black/20 px-8 py-6 overflow-y-auto">
      <div className="flex min-h-full flex-col overflow-x-hidden justify-end gap-5">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex overflow-x-hidden w-full items-end gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="flex size-10 overflow-x-hidden  shrink-0 items-center justify-center rounded-2xl bg-[#7c3aed]">
                  <img className="size-6 " src={bot} alt="Gemini assistant" />
                </div>
              )}

              <div
                className={`max-w-[68%] break-words overflow-hidden rounded-2xl px-5 py-4 text-sm leading-6 shadow-lg ${
                  isUser
                    ? "rounded-br-md bg-[#7c3aed] text-white shadow-violet-950/30"
                    : "rounded-bl-md border border-[#4c4c4c] bg-[#050505] text-[#dbe4f0]"
                }`}
              >
                {!isUser && (
                  <p className="mb-2 text-xs font-semibold text-[#a78bfa]">
                    Ultron AI
                  </p>
                )}
                {isUser ? (
                  <p>{message.text}</p>
                ) : (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                )}
              </div>

              {isUser && (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#7c3aed] bg-[#140b22] text-sm font-bold text-white">
                  U
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Chatsection;
