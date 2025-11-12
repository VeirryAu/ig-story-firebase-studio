"use client";

import { useEffect, useState } from "react";

export function Screen7() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    // Animate progress bar
    const duration = 2000;
    const steps = 100;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) {
        clearInterval(timer);
        setProgress(100);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-green-600 via-emerald-500 to-teal-400 flex items-center justify-center overflow-hidden">
      {/* Animated lines */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-1 bg-white/10"
            style={{
              top: `${(i + 1) * 12.5}%`,
              transform: `translateX(${isVisible ? 0 : '-100%'})`,
              transition: `transform ${1 + i * 0.2}s ease-out`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-8">
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-8 drop-shadow-2xl animate-in fade-in slide-in-from-top-8 duration-1000">
          Growth
        </h2>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="text-center mb-6">
              <div className="text-6xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl">
                {Math.round(progress)}%
              </div>
              <p className="text-2xl md:text-3xl text-white/90 font-semibold">
                Progress Made
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-6 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center text-white/90 text-lg md:text-xl animate-in fade-in duration-1000 delay-500">
            Every step forward counts
          </div>
        </div>
      </div>
    </div>
  );
}

