"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen7Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen7({ serverResponse, isActive = false }: Screen7Props) {
  const { t } = useTranslations();
  const favoriteStores = serverResponse?.listFavoriteStore || [];
  const displayStores = favoriteStores.slice(0, 3);

  const barColors = ['#2db288', '#a1b04a', '#27b5c8'];
  const [showHeader, setShowHeader] = useState(false);
  const [visibleBars, setVisibleBars] = useState<number[]>([]);
  const [visibleLabels, setVisibleLabels] = useState<number[]>([]);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowHeader(false);
      setVisibleBars([]);
      setVisibleLabels([]);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowHeader(true);
    displayStores.forEach((_, index) => {
      const barDelay = 220 + index * 180;
      const labelDelay = barDelay + 120;

      timers.push(
        setTimeout(() => {
          setVisibleBars(prev => (prev.includes(index) ? prev : [...prev, index]));
        }, barDelay),
      );

      timers.push(
        setTimeout(() => {
          setVisibleLabels(prev => (prev.includes(index) ? prev : [...prev, index]));
        }, labelDelay),
      );
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, displayStores]);

  const maxTransactions = useMemo(() => Math.max(...displayStores.map(s => s.transactionCount), 1), [displayStores]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center px-6 py-8 overflow-hidden"
      style={{ backgroundColor: 'rgba(26, 64, 52, 1)' }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id="gradient1-screen7" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#2db288', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: 'rgba(26, 64, 52, 1)', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#2db288', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient1-screen7)"
            style={{
              animation: 'morphWave1 11s ease-in-out infinite',
              animationDelay: '0s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,180 C350,220 450,140 850,180 C1150,210 1400,130 1700,170 C2000,200 2200,150 2400,180 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 2 - Medium dark green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '30%' }}>
          <defs>
            <linearGradient id="gradient2-screen7" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'rgba(26, 64, 52, 1)', stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: '#1A4034', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(26, 64, 52, 1)', stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient2-screen7)"
            style={{
              animation: 'morphWave2 15s ease-in-out infinite',
              animationDelay: '-3s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,160 C280,200 520,110 820,150 C1180,190 1350,120 1650,160 C1950,200 2150,130 2400,150 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 3 - Dark green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '60%' }}>
          <defs>
            <linearGradient id="gradient3-screen7" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1A4034', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#1A4034', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient3-screen7)"
            style={{
              animation: 'morphWave3 13s ease-in-out infinite',
              animationDelay: '-7s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,190 C320,230 550,150 850,190 C1100,220 1450,140 1750,180 C2050,210 2250,160 2400,190 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 4 - Very dark green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '90%' }}>
          <defs>
            <linearGradient id="gradient4-screen7" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: '#081810', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient4-screen7)"
            style={{
              animation: 'morphWave4 17s ease-in-out infinite',
              animationDelay: '-10s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,170 C300,210 580,130 880,170 C1200,200 1420,150 1720,180 C2020,210 2220,140 2400,170 L2400,320 L0,320 Z" 
          />
        </svg>
      </div>

      {/* Top Text */}
      <p
        className={`relative z-10 text-white font-bold text-center text-lg mb-8 mt-16 px-4 transition-all duration-500 ${
          showHeader ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {t('screen7.topText')}
      </p>

      {/* Bars */}
      <div className="w-full max-w-md flex items-end justify-center gap-4" style={{ height: '400px' }}>
        {displayStores.map((store, index) => {
          const barColor = barColors[index] || barColors[0];
          const barHeightPercentage = (store.transactionCount / maxTransactions) * 100;
          const minHeight = 120;
          const maxHeight = 300;
          const barHeight = minHeight + ((maxHeight - minHeight) * (barHeightPercentage / 100));
          const isVisible = visibleBars.includes(index);
          const transitionDelay = `${isVisible ? index * 140 : 0}ms`;

          return (
            <div
              key={index}
              className={`flex flex-col items-center relative transition-all duration-600 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                width: '100px',
                height: `${barHeight}px`,
                transitionDelay,
              }}
            >
              {/* Vertical Bar */}
              <div
                className="w-full rounded-lg flex flex-col items-center relative pt-3 pb-2"
                style={{ 
                  backgroundColor: barColor,
                  height: '100%',
                }}
              >
                {/* Circle Image */}
                <div className="absolute top-0" style={{ marginTop: '-52px' }}>
                  {store.storeImage ? (
                    <div 
                      className={`relative rounded-full overflow-hidden transition-all duration-500 ${
                        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      }`}
                      style={{
                        border: '10px solid rgba(0, 0, 0, 0.2)',
                        width: '80px',
                        height: '80px',
                      }}
                    >
                      <Image
                        src={store.storeImage}
                        alt={store.storeName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className={`relative rounded-full flex items-center justify-center transition-all duration-500 ${
                        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      }`}
                      style={{
                        border: '10px solid rgba(0, 0, 0, 0.2)',
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <span className="text-white font-bold text-xl">
                        {store.storeName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1" />

                {/* Store Name */}
                <div
                  className={`flex flex-col items-center px-2 mt-auto transition-all duration-400 ${
                    visibleLabels.includes(index)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  }`}
                >
                  <p className="text-white font-bold text-sm text-center leading-tight mb-1">
                    {store.storeName}
                  </p>
                  <p className="text-white/90 text-xs text-center">
                    {store.transactionCount} {t('screen7.transactions')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
