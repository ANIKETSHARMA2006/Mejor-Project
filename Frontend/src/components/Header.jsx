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

    <div className="w-[95%] max-w-[1250px] mx-auto rounded-t-xl border border-[#4c4c4c] flex items-center justify-between shrink-0">

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
        <button onClick={handleClick} className="text-white text-xs md:text-sm px-3 md:px-4 rounded-xl md:rounded-2xl py-1.5 md:py-2 bg-[#7c3aed] hover:bg-violet-600 transition-colors">New Session</button>
        <button onClick={handleLogout} className="text-white text-xs md:text-sm px-3 md:px-4 rounded-xl md:rounded-2xl py-1.5 md:py-2 bg-red-600 hover:bg-red-700 transition-colors">Logout</button>
      </div>
    </div>
  );
};

export default Header;
