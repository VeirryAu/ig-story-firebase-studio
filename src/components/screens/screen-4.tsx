"use client";

import { useEffect, useState } from "react";

export function Screen4() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const highlights = [
    { emoji: "🚀", text: "Major Launch", delay: "0ms" },
    { emoji: "🏆", text: "Big Win", delay: "200ms" },
    { emoji: "✨", text: "Special Moment", delay: "400ms" },
    { emoji: "🎯", text: "Goal Achieved", delay: "600ms" },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center overflow-hidden">
      {/* Animated circles */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-white/20 animate-ping"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-8">
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-16 drop-shadow-2xl animate-in fade-in zoom-in-50 duration-1000">
          Highlights
        </h2>

        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className={`bg-white/20 backdrop-blur-md rounded-3xl p-8 text-center transform transition-all duration-700 ${
                isVisible
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-50 rotate-12"
              }`}
              style={{ transitionDelay: highlight.delay }}
            >
              <div className="text-6xl md:text-8xl mb-4 animate-bounce" style={{ animationDelay: highlight.delay }}>
                {highlight.emoji}
              </div>
              <div className="text-xl md:text-2xl font-semibold text-white drop-shadow-lg">
                {highlight.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

