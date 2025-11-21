"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/use-translations";

interface Screen2NoTrxProps {
  isActive?: boolean;
}

export function Screen2NoTrx({ isActive = false }: Screen2NoTrxProps) {
  const { t } = useTranslations();
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowTop(false);
      setShowBottom(false);
      return;
    }

    setShowTop(true);
    const bottomTimer = setTimeout(() => setShowBottom(true), 250);

    return () => clearTimeout(bottomTimer);
  }, [isActive]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#006041' }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id="gradient1-screen2notrx" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#2DB288', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: '#006041', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#2DB288', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient1-screen2notrx)"
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
            <linearGradient id="gradient2-screen2notrx" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#006041', stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: '#1A4034', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#006041', stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient2-screen2notrx)"
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
            <linearGradient id="gradient3-screen2notrx" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1A4034', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#1A4034', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient3-screen2notrx)"
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
            <linearGradient id="gradient4-screen2notrx" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: '#081810', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient4-screen2notrx)"
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

        {/* Top half of card - First text */}
        <div 
          className={`relative z-10 flex-1 flex items-center justify-center px-6 py-8 mb-80 transition-all duration-600 ${
            showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-white font-bold text-center text-lg leading-relaxed whitespace-pre-line">
            {t('screen2Notrx.topText')}
          </p>
        </div>
      {/* Card - half of the screen */}
      <div 
        className={`absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col transition-all duration-600 ${
          showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ 
          backgroundColor: '#1A4034',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}
      >

        {/* Bottom half of card - Second text */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <p className="text-white font-bold text-center text-lg leading-relaxed">
            {t('screen2Notrx.bottomText')}
          </p>
        </div>

        {/* Button removed - now handled in story-viewer.tsx */}
      </div>
    </div>
  );
}

