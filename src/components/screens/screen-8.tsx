"use client";

import { useEffect, useState } from "react";

export function Screen8() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const challenges = [
    { icon: "💪", text: "Strength", delay: "0ms" },
    { icon: "🎯", text: "Resilience", delay: "200ms" },
    { icon: "🔥", text: "Determination", delay: "400ms" },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 flex items-center justify-center overflow-hidden">
      {/* Animated waves */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white/10 animate-wave" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white/5 animate-wave" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative z-10 w-full px-8">
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-4 drop-shadow-2xl animate-in fade-in zoom-in-50 duration-1000">
          Challenges
        </h2>
        <p className="text-2xl md:text-3xl text-white/90 text-center mb-16 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          Overcome
        </p>

        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className={`bg-white/25 backdrop-blur-lg rounded-3xl p-8 text-center transform transition-all duration-700 ${
                isVisible
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-75 translate-y-20"
              }`}
              style={{ transitionDelay: challenge.delay }}
            >
              <div className="text-7xl md:text-8xl mb-4 animate-pulse" style={{ animationDelay: challenge.delay }}>
                {challenge.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                {challenge.text}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-white/80 text-xl md:text-2xl animate-in fade-in duration-1000 delay-700">
          You did it! 🎉
        </div>
      </div>
    </div>
  );
}

