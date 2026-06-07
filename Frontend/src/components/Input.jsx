import React, { useRef, useState } from "react";
import Search from "../assets/search.svg";
import Mic from "../assets/mic.svg";
import Stop from "../assets/stop.svg";

const Input = ({ inputRef, handleSubmit }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      if (inputRef.current) {
        inputRef.current.value += " " + transcript;
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="w-312.5 mx-auto h-23 rounded-b-xl border flex items-center border-[#4c4c4c]"
      >
        <input
          placeholder="How can I help you? Write your question here."
          className="bg-[#000000] w-[100%] border border-white hover:border-[#7c3aed] hover:border-3 h-[65%] text-white text-m p-5 rounded-4xl mx-4"
          type="text"
          ref={inputRef}
        />

        {/* Mic / Stop Button */}
        {isListening ? (
          <button
            type="button"
            onClick={stopListening}
            className="flex items-center justify-center h-[65%] w-[5%] cursor-pointer"
          >
            <img className="w-7" src={Stop} alt="stop button" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startListening}
            className="flex items-center justify-center h-[65%] w-[5%] cursor-pointer"
          >
            <img className="w-7" src={Mic} alt="mic button" />
          </button>
        )}

        <button
          type="submit"
          className="flex items-center justify-center h-[55%] w-[5%] mx-5 mr-8 cursor-pointer"
        >
          <img className="w-9 ml-3" src={Search} alt="search button" />
        </button>
      </form>
    </div>
  );
};

export default Input;