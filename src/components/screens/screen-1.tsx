"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/use-translations";

interface Screen1Props {
  userName?: string;
}

export function Screen1({ userName = "John" }: Screen1Props) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#6b8e5f' }}>
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 */}
        <svg className="wave-layer wave-layer-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#a0b968', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#6b8e5f', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: '#a0b968', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path d="M0,180 C350,220 450,140 850,180 C1150,210 1400,130 1700,170 C2000,200 2200,150 2400,180 L2400,320 L0,320 Z" />
        </svg>
        
        {/* Wave 2 */}
        <svg className="wave-layer wave-layer-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#7fa374', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#4a6d3e', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#7fa374', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          <path d="M0,160 C280,200 520,110 820,150 C1180,190 1350,120 1650,160 C1950,200 2150,130 2400,150 L2400,320 L0,320 Z" />
        </svg>
        
        {/* Wave 3 */}
        <svg className="wave-layer wave-layer-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#6d9262', stopOpacity: 0.7 }} />
              <stop offset="50%" style={{ stopColor: '#3d5c33', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#6d9262', stopOpacity: 0.7 }} />
            </linearGradient>
          </defs>
          <path d="M0,190 C320,230 550,150 850,190 C1100,220 1450,140 1750,180 C2050,210 2250,160 2400,190 L2400,320 L0,320 Z" />
        </svg>
        
        {/* Wave 4 */}
        <svg className="wave-layer wave-layer-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#5da399', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#2d6b64', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#5da399', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          <path d="M0,170 C300,210 580,130 880,170 C1200,200 1420,150 1720,180 C2020,210 2220,140 2400,170 L2400,320 L0,320 Z" />
        </svg>
      </div>

      {/* Content container */}
      <div className={`relative z-10 flex flex-col items-center justify-center px-6 text-center transition-all duration-1000 pt-1 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        {/* Greeting */}
        <h1 className="text-lg font-bold text-white mb-4 drop-shadow-lg">
          {t('screen1.greeting', { userName })}
        </h1>
        
        {/* First paragraph */}
        <p className="text-lg font-bold text-white mb-6 max-w-md leading-relaxed drop-shadow-md">
          {t('screen1.paragraph1')}
        </p>
        
        {/* "Here is your coffee core!" with rectangle background and rotation */}
          <div
          className="mb-40 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg"
          style={{ transform: 'rotate(-1.4deg)' }}
        >
          <p className="text-lg font-bold text-white drop-shadow-md">
            {t('screen1.coffeeCore')}
          </p>
        </div>
        
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/stories-asset/slides01/slide1-logo.png"
            alt="Fore Logo"
            width={250}
            height={250}
            className="object-contain drop-shadow-2xl"
            priority
          />
      </div>

        {/* Date range */}
        <p className="text-base text-white/90 drop-shadow-sm">
          {t('common.januaryNovember')}
        </p>
      </div>
    </div>
  );
}

