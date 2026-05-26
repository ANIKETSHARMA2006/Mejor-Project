import React from "react";

const StarsBackground = () => {
  const stars = Array.from({ length: 120 });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
      {stars.map((_, i) => {
        const size = Math.random() * 3 + 1;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;

        return (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${top}%`,
              left: `${left}%`,
              opacity: Math.random(),
              animationDelay: `${delay}s`,
              boxShadow:
                size > 2
                  ? "0 0 8px rgba(255,255,255,0.8)"
                  : "0 0 4px rgba(255,255,255,0.4)",
            }}
          />
        );
      })}
    </div>
  );
};

export default StarsBackground;