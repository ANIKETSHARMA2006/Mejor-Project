import React from "react";
import whiterobo from "../assets/white-robo.svg";

const Header = () => {

  function handleClick() {
    window.location.reload();
  }

  return (

    <div className="w-270 mx-auto rounded-t-xl border border-[#4c4c4c] flex  items-center justify-between">

      <div className="flex items-center">
        <div className="p-3 pl-7">
          <img
            className="p-2 bg-[#7c3aed] size-10 rounded-2xl"
            src={whiterobo}
            alt="image"
          />
        </div>
        <div className="ml-2">
          <h1 className="text-white pt-1">New writing session</h1>
          <p className="text-[#757474] text-xs font-semibold">
            Ai writing Assistant : Always improving.
          </p>
        </div>
      </div>
      <div className="btn-con ">
        <button onClick={handleClick} className=" text-white mr-8 px-4 rounded-2xl py-2 bg-[#7c3aed]">New Session</button>
      </div>
    </div>
  );
};

export default Header;
