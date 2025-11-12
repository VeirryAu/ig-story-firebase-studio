"use client";

import { useEffect, useState } from "react";

export function Screen3() {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ projects: 0, achievements: 0, memories: 0 });

  useEffect(() => {
    setIsVisible(true);
    // Animate counters
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounters({
        projects: Math.floor(50 * progress),
        achievements: Math.floor(120 * progress),
        memories: Math.floor(365 * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters({ projects: 50, achievements: 120, memories: 365 });
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Projects", value: counters.projects, suffix: "+", color: "from-blue-500 to-cyan-400" },
    { label: "Achievements", value: counters.achievements, suffix: "+", color: "from-purple-500 to-pink-400" },
    { label: "Memories", value: counters.memories, suffix: "", color: "from-orange-500 to-red-400" },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 w-full px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12 drop-shadow-lg animate-in fade-in slide-in-from-top-8 duration-1000">
          By The Numbers
        </h2>

        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 shadow-2xl transform transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-[-50px] scale-95"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="text-center">
                <div className="text-5xl md:text-7xl font-black text-white mb-2">
                  {stat.value}
                  <span className="text-3xl md:text-5xl">{stat.suffix}</span>
                </div>
                <div className="text-xl md:text-2xl text-white/90 font-semibold">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

