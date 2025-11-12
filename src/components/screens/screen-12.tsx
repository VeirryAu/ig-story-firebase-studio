"use client";

import { useEffect, useState } from "react";

export function Screen12() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-center justify-center overflow-hidden">
      {/* Animated confetti */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 6)],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center text-white px-8">
        <div
          className={`transition-all duration-1000 ${
            isVisible
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-90 rotate-6"
          }`}
        >
          <div className="text-7xl md:text-9xl mb-8 animate-bounce drop-shadow-2xl">
            🎊
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl animate-in fade-in zoom-in-50 duration-1000 delay-300">
            Until Next Time
          </h2>
          <p className="text-2xl md:text-3xl font-light drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            Here's to another great year!
          </p>
        </div>
      </div>
    </div>
  );
}

