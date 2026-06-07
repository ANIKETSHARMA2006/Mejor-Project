import React from "react";
import bot from "../assets/bot-stroke-rounded.svg";

const Open = ({inputRef, username}) => {

  function handleClick(e){
    inputRef.current.value=e.currentTarget.innerText;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayUsername = username ? username.charAt(0).toUpperCase() + username.slice(1) : "";

  return (
    <div className="w-312.5 mx-auto h-[74%] overflow-x-hidden border-x border-[#4c4c4c]">
      <div className="flex flex-col items-center gap-2">
        <img
          className=" h-17 w-17 mt-5 p-3 rounded-2xl bg-[#000000]"
          src={bot}
          alt="image"
        />
        <h2 className="text-4xl font-serif text-[#e2e8f0] mx-auto mt-2 tracking-wide">
          {getGreeting()}{displayUsername ? `, ${displayUsername}` : ""}
        </h2>
        <p className="text-[#94a3b8] font-semibold ">
          From first draft to final edit, i'm here to help you write better,
          faster.
        </p>
        <h2 className=" text-xl mt-10 font-bold text-white mx-auto">
          What would you like to write today?
        </h2>
        <div className="grid grid-cols-2 gap-4 mt-10 text-white p-2">
          <button onClick={handleClick} className="py-6 px-10 bg-black rounded-2xl text-sm cursor-pointer hover:border hover:border-violet-600 transition-all duration-300">
            Write a professional email to my boss about a project update
          </button>

          <button onClick={handleClick} className="py-6 px-10 bg-black rounded-2xl text-sm cursor-pointer hover:border hover:border-violet-600 transition-all duration-300">
            Draft a compelling LinkedIn post about a recent achievement
          </button>

          <button onClick={handleClick} className="py-6 px-10 bg-black rounded-2xl text-sm cursor-pointer hover:border hover:border-violet-600 transition-all duration-300">
            Create an executive summary for a quarterly business report
          </button>

          <button onClick={handleClick} className="py-6 px-10 bg-black rounded-2xl text-sm cursor-pointer hover:border hover:border-violet-600 transition-all duration-300">
            Write a persuasive proposal for a new marketing campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default Open;
