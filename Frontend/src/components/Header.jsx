import React from "react";
import whiterobo from "../assets/white-robo.svg";

const Header = () => {

  function handleClick() {
    sessionStorage.removeItem('chat_session_id');
    window.location.reload();
  }

  function handleLogout() {
    sessionStorage.removeItem('chat_session_id');
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://mejor-backend.onrender.com');
    window.location.href = `${API_BASE_URL}/logout`;
  }

  return (

    <div className="w-full border-b border-[#4c4c4c] flex items-center justify-between shrink-0 bg-black/20">

      <div className="flex items-center">
        <div className="p-2 md:p-3 pl-4 md:pl-7">
          <img
            className="p-1.5 md:p-2 bg-[#7c3aed] size-8 md:size-10 rounded-xl md:rounded-2xl"
            src={whiterobo}
            alt="image"
          />
        </div>
        <div className="ml-2">
          <h1 className="text-white pt-1 text-sm md:text-base">New writing session</h1>
          <p className="text-[#757474] text-[10px] md:text-xs font-semibold hidden sm:block">
            Ai writing Assistant : Always improving.
          </p>
        </div>
      </div>
      <div className="btn-con flex items-center gap-2 md:gap-3 mr-4 md:mr-8">
        <button 
          onClick={handleClick} 
          className="relative z-0 group bg-transparent cursor-pointer overflow-hidden rounded-xl md:rounded-2xl border-2 border-[#7c3aed] text-white transition-all duration-500 ease-in-out hover:shadow-[0_0_20px_#7c3aed] px-3 md:px-5 py-1.5 md:py-2.5 after:content-[''] after:absolute after:left-0 after:top-0 after:transition-all after:duration-500 after:ease-in-out after:bg-[#7c3aed] after:rounded-[30px] after:invisible after:h-[10px] after:w-[10px] after:-z-10 group-hover:after:visible group-hover:after:scale-[100] group-hover:after:translate-x-[2px] flex items-center justify-center"
        >
          <span className="relative z-10 text-[10px] md:text-xs font-extrabold tracking-[2px] md:tracking-[4px]">NEW SESSION</span>
        </button>
        <button 
          onClick={handleLogout} 
          className="relative z-0 group bg-transparent cursor-pointer overflow-hidden rounded-xl md:rounded-2xl border-2 border-[#dc2626] text-white transition-all duration-500 ease-in-out hover:shadow-[0_0_20px_#dc2626] px-3 md:px-5 py-1.5 md:py-2.5 after:content-[''] after:absolute after:left-0 after:top-0 after:transition-all after:duration-500 after:ease-in-out after:bg-[#dc2626] after:rounded-[30px] after:invisible after:h-[10px] after:w-[10px] after:-z-10 group-hover:after:visible group-hover:after:scale-[100] group-hover:after:translate-x-[2px] flex items-center justify-center"
        >
          <span className="relative z-10 text-[10px] md:text-xs font-extrabold tracking-[2px] md:tracking-[4px]">LOGOUT</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
