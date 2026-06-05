import React from "react";
import Search from "../assets/search.svg";

const Input = ({ inputRef, handleSubmit }) => {
  

  return (
    <div>
      <form onSubmit={handleSubmit}
        className="w-270 mx-auto h-23 rounded-b-xl border flex items-center border-[#4c4c4c]"
        action=""
      >
        <input
          placeholder="How can I help you? Write your question here."
          className="bg-[#000000] w-[90%] border border-white hover:border-[#7c3aed] hover:border-3 h-[65%] text-white text-m text-wrap p-5 rounded-4xl mx-4"
          type="text"
          ref={inputRef}
        />
        <button
          type="submit"
          className="flex items-center rounded-4xl justify-center  h-[65%] w-[10%] mr-5 " 
        >
          <img className="w-9 ml-3" src={Search} alt="search button" />
        </button>
      </form>
    </div>
  );
};

export default Input;
