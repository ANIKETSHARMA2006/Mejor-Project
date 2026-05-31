import React from "react";
import bot from "../assets/bot-stroke-rounded.svg";

const Open = () => {
  return (
    <div className="w-270 mx-auto h-[74%]  border-x border-[#4c4c4c]">
      <div className="flex flex-col items-center gap-2">
        <img
          className=" h-17 w-17 mt-5 p-3 rounded-2xl bg-[#000000]"
          src={bot}
          alt="image"
        />
        <h2 className=" text-2xl font-bold text-white mx-auto">
          Your AI companion
        </h2>
        <p className="text-[#94a3b8] font-semibold ">
          From first draft to final edit, i'm here to help you write better,
          faster.
        </p>
        <h2 className=" text-xl mt-10 font-bold text-white mx-auto">
          What would you like to write today?
        </h2>
        <div className="grid grid-cols-2 gap-4 mt-10 text-white p-2">
          <button className="py-6 px-10 bg-black rounded-2xl text-sm cursor-pointer hover:border hover:border-violet-600 transition-all duration-300">
            Write a professional email to my boss about a project update
          </button>

          <button className="py-6 px-10 bg-black rounded-2xl text-sm cursor-pointer hover:border hover:border-violet-600 transition-all duration-300">
            Draft a compelling LinkedIn post about a recent achievement
          </button>

          <button className="py-6 px-10 bg-black rounded-2xl text-sm cursor-pointer hover:border hover:border-violet-600 transition-all duration-300">
            Create an executive summary for a quarterly business report
          </button>

          <button className="py-6 px-10 bg-black rounded-2xl text-sm cursor-pointer hover:border hover:border-violet-600 transition-all duration-300">
            Write a persuasive proposal for a new marketing campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default Open;
