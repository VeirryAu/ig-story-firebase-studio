"use client";

import { useEffect, useState } from "react";

interface Screen2Props {
  trxCount?: number;
}

export function Screen2({ trxCount }: Screen2Props) {
  const [isVisible, setIsVisible] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Year number with flip animation */}
      <div className="relative z-10">
        <div
          className={`text-center transition-all duration-1000 ${
            isVisible
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-12 scale-75"
          }`}
        >
          <div className="text-9xl md:text-[12rem] font-black text-white drop-shadow-2xl mb-4 animate-in zoom-in-50 duration-1000">
            {currentYear}
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-light animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            A Year to Remember
          </p>
        </div>
      </div>

      {/* Animated border glow */}
      <div className="absolute inset-0 border-4 border-white/20 animate-pulse" />
    </div>
  );
}

