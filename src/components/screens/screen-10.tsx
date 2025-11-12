"use client";

import { useEffect, useState } from "react";

export function Screen10() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 flex items-center justify-center overflow-hidden">
      {/* Animated bubbles */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-bubble"
            style={{
              width: `${20 + Math.random() * 60}px`,
              height: `${20 + Math.random() * 60}px`,
              left: `${Math.random() * 100}%`,
              bottom: "-50px",
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center text-white px-8">
        <div
          className={`transition-all duration-1000 ${
            isVisible
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-75 rotate-12"
          }`}
        >
          <div className="text-8xl md:text-9xl mb-8 animate-bounce drop-shadow-2xl">
            🙏
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Thank You
          </h2>
          <p className="text-2xl md:text-3xl font-light drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            For an amazing year together
          </p>
        </div>
      </div>
    </div>
  );
}

