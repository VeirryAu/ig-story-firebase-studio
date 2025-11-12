"use client";

import { useEffect, useState } from "react";

export function Screen1() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content with fade-in and scale animation */}
      <div
        className={`text-center text-white z-10 transition-all duration-1000 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-10"
        }`}
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-4 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Welcome
        </h1>
        <p className="text-2xl md:text-3xl font-light drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          Your Year in Review
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="w-16 h-1 bg-white/50 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

