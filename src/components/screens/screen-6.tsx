"use client";

import { useEffect, useState } from "react";

export function Screen6() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const memories = [
    { emoji: "📸", label: "Photos", delay: "0ms" },
    { emoji: "🎉", label: "Celebrations", delay: "150ms" },
    { emoji: "👥", label: "Together", delay: "300ms" },
    { emoji: "💝", label: "Moments", delay: "450ms" },
    { emoji: "🌅", label: "Adventures", delay: "600ms" },
    { emoji: "🎊", label: "Joy", delay: "750ms" },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 flex items-center justify-center overflow-hidden">
      {/* Floating hearts */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full px-8">
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-16 drop-shadow-2xl animate-in fade-in zoom-in-50 duration-1000">
          Memories
        </h2>

        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          {memories.map((memory, index) => (
            <div
              key={index}
              className={`bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center transform transition-all duration-700 hover:scale-110 ${
                isVisible
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-0 rotate-180"
              }`}
              style={{ transitionDelay: memory.delay }}
            >
              <div className="text-5xl md:text-6xl mb-3 animate-bounce" style={{ animationDelay: memory.delay }}>
                {memory.emoji}
              </div>
              <div className="text-lg md:text-xl font-semibold text-white drop-shadow-lg">
                {memory.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

