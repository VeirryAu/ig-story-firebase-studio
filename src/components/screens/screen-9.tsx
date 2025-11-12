"use client";

import { useEffect, useState } from "react";

export function Screen9() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveMilestone((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const milestones = [
    { month: "Jan", achievement: "Started Strong" },
    { month: "Jun", achievement: "Halfway There" },
    { month: "Sep", achievement: "Breaking Records" },
    { month: "Dec", achievement: "Year Complete" },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 flex items-center justify-center overflow-hidden">
      {/* Animated timeline line */}
      <div className="absolute left-1/2 top-1/4 bottom-1/4 w-1 bg-white/30 transform -translate-x-1/2" />

      <div className="relative z-10 w-full px-8">
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-16 drop-shadow-2xl animate-in fade-in slide-in-from-top-8 duration-1000">
          Milestones
        </h2>

        <div className="max-w-3xl mx-auto space-y-8">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`flex items-center gap-6 transform transition-all duration-500 ${
                activeMilestone === index
                  ? "opacity-100 scale-105 translate-x-0"
                  : "opacity-50 scale-100 translate-x-[-30px]"
              }`}
            >
              <div className={`flex-shrink-0 w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold transition-all duration-500 ${
                activeMilestone === index ? "scale-125 shadow-2xl" : "scale-100"
              }`}>
                {milestone.month}
              </div>
              <div className="flex-1 bg-white/25 backdrop-blur-md rounded-2xl p-6">
                <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  {milestone.achievement}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

