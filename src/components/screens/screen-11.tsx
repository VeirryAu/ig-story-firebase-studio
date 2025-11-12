"use client";

import { useEffect, useState } from "react";

export function Screen11() {
  const [isVisible, setIsVisible] = useState(false);
  const nextYear = new Date().getFullYear() + 1;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
      {/* Animated sun rays */}
      <div className="absolute inset-0">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1/2 bg-white/30 origin-bottom"
            style={{
              left: "50%",
              bottom: "50%",
              transform: `translateX(-50%) rotate(${i * 22.5}deg)`,
              animation: `pulse 2s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center text-white px-8">
        <div
          className={`transition-all duration-1000 ${
            isVisible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-50"
          }`}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Looking Forward
          </h2>
          <div className="text-7xl md:text-9xl font-black mb-8 drop-shadow-2xl animate-in zoom-in-50 duration-1000 delay-300">
            {nextYear}
          </div>
          <p className="text-2xl md:text-3xl font-light drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            New adventures await
          </p>
        </div>
      </div>
    </div>
  );
}

