"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/hooks/use-translations";

interface Screen2Props {
  trxCount?: number;
  isActive?: boolean;
}

export function Screen2({ trxCount = 0, isActive = false }: Screen2Props) {
  const { t } = useTranslations();
  const animationFrameRef = useRef<number>();

  const [showTopText, setShowTopText] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const circleSize = 220;
  const numberClass =
    trxCount >= 10000 ? 'text-5xl' : trxCount >= 1000 ? 'text-6xl' : 'text-7xl';

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setShowTopText(false);
      setShowCircle(false);
      setShowBottom(false);
      setShowLogo(false);
      setAnimatedCount(0);
      return;
    }

    setShowTopText(true);
    const circleTimer = setTimeout(() => setShowCircle(true), 200);
    const logoTimer = setTimeout(() => setShowLogo(true), 260);
    const bottomTimer = setTimeout(() => setShowBottom(true), 350);

    const countTimer = setTimeout(() => {
      const duration = 1200;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedCount(Math.round(trxCount * eased));
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setAnimatedCount(trxCount);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }, 400);

    return () => {
      clearTimeout(circleTimer);
      clearTimeout(logoTimer);
      clearTimeout(bottomTimer);
      clearTimeout(countTimer);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive, trxCount]);

  return (
    <div 
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#1F935C' }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright teal/cyan */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '-30%' }}>
          <defs>
            <linearGradient id="gradient1-screen2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#4ECDC4', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: '#2DB288', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#4ECDC4', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient1-screen2)"
            style={{
              animation: 'morphWave1 11s ease-in-out infinite',
              animationDelay: '0s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,180 C350,220 450,140 850,180 C1150,210 1400,130 1700,170 C2000,200 2200,150 2400,180 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 2 - Light green to medium green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '-20%' }}>
          <defs>
            <linearGradient id="gradient2-screen2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#2DB288', stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: '#1F935C', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#2DB288', stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient2-screen2)"
            style={{
              animation: 'morphWave2 15s ease-in-out infinite',
              animationDelay: '-3s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,160 C280,200 520,110 820,150 C1180,190 1350,120 1650,160 C1950,200 2150,130 2400,150 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 3 - Medium green to dark green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '-10%' }}>
          <defs>
            <linearGradient id="gradient3-screen2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1F935C', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#1A4034', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#1F935C', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient3-screen2)"
            style={{
              animation: 'morphWave3 13s ease-in-out infinite',
              animationDelay: '-7s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,190 C320,230 550,150 850,190 C1100,220 1450,140 1750,180 C2050,210 2250,160 2400,190 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 4 - Dark green to very dark */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id="gradient4-screen2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1A4034', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: '#1A4034', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient4-screen2)"
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

      {/* Card - 1/3 of the screen */}
      <div 
        className="relative z-10 w-full flex flex-col items-center px-6 pt-8 pb-12 overflow-visible"
        style={{
          marginBottom: '40vh',
          minHeight: '60vh'
        }}
      >
        {/* Top text */}
        <p className="text-white font-bold text-center text-lg mt-16 mb-6 space-y-1">
          <span
            className={`block transform transition-all duration-500 ${
              showTopText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {t('screen2.topText')}
          </span>
          <span
            className={`block transform transition-all duration-500 ${
              showTopText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{ transitionDelay: showTopText ? '120ms' : '0ms' }}
          >
            {t('screen2.topTextSecondary')}
          </span>
        </p>

        {/* Infographic circle with overflow logo */}
        <div className="relative mb-4">
          <div 
            className={`relative w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-out ${
              showCircle ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
            style={{ backgroundColor: '#2DB288', width: circleSize, height: circleSize }}
          >
            {/* Number and Cups text */}
            <div className="text-center z-10">
              <div className={`text-white font-bold leading-none ${numberClass}`}>
                {animatedCount}
              </div>
              <div className="text-white font-bold text-md mt-1">
                {t('screen2.cups')}
              </div>
            </div>
          </div>
          
          {/* Overflow logo at bottom of circle */}
          <div
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20 transition-all duration-500 ${
              showLogo ? "opacity-100 scale-100 translate-y-1/2" : "opacity-0 scale-75 translate-y-full"
            }`}
          >
            <Image
              src="/stories-asset/slides02/fore-cup-logo.svg"
              alt="Fore Cup Logo"
              width={80}
              height={80}
              className="w-16 h-16"
            />
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-white font-bold text-center text-sm px-4" />
      </div>

      <div 
        className={`absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col transition-all duration-600 z-10 ${
          showBottom ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ 
          height: '40%',
          backgroundColor: '#1A4034',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}
      >

        {/* Bottom half of card - Second text */}
        <div
          className={`flex items-center justify-center px-6 pt-8 pb-6 transition-all duration-600 ${
            showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-white font-bold text-center text-lg leading-relaxed">
            {t('screen2.bottomText')}
          </p>
        </div>

        {/* Coffee journey decoration image below the text */}
        <div
          className={`flex-1 relative w-full px-6 pb-6 transition-all duration-600 delay-100 ${
            showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Image
            src="/stories-asset/slides02/slide-2-decoration.svg"
            alt="Coffee journey decoration"
            fill
            className="object-contain object-center"
            priority
          />
        </div>
      </div>
    </div>
  );
}

