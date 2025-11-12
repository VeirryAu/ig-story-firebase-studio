"use client";

import { useEffect, useState } from "react";

export function Screen5() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const achievements = [
    { title: "Innovation", description: "Pushed boundaries", icon: "💡" },
    { title: "Excellence", description: "Raised the bar", icon: "⭐" },
    { title: "Impact", description: "Made a difference", icon: "🌟" },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
      {/* Animated rays */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-full bg-white/20 origin-center"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              animation: `pulse 2s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-8">
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-12 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Achievements
        </h2>

        <div className="max-w-2xl mx-auto space-y-6">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`bg-white/25 backdrop-blur-lg rounded-2xl p-6 transform transition-all duration-500 ${
                activeIndex === index
                  ? "opacity-100 scale-105 translate-x-0 shadow-2xl"
                  : "opacity-60 scale-100 translate-x-[-20px]"
              }`}
            >
              <div className="flex items-center gap-6">
                <div className="text-6xl md:text-7xl animate-spin-slow">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {achievement.title}
                  </h3>
                  <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

