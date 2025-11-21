"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen5Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen5({ serverResponse, isActive = false }: Screen5Props) {
  const { t } = useTranslations();
  const totalPoint = serverResponse?.totalPoint || 0;
  const totalPointPossibleRedeem = serverResponse?.totalPointPossibleRedeem || 0;
  const totalPointProductName = serverResponse?.totalPointProductName || 'Aren Latte';
  const totalPointImage = serverResponse?.totalPointImage || 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&crop=center';

  const animationFrameRef = useRef<number>();

  const [showHeader, setShowHeader] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [animatedPoint, setAnimatedPoint] = useState(0);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setShowHeader(false);
      setShowCircle(false);
      setShowBottom(false);
      setAnimatedPoint(0);
      return;
    }

    setShowHeader(true);
    const circleTimer = setTimeout(() => setShowCircle(true), 200);
    const bottomTimer = setTimeout(() => setShowBottom(true), 400);

    const countTimer = setTimeout(() => {
      const duration = 1200;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedPoint(Math.round(totalPoint * eased));
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setAnimatedPoint(totalPoint);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }, 350);

    return () => {
      clearTimeout(circleTimer);
      clearTimeout(bottomTimer);
      clearTimeout(countTimer);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive, totalPoint]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center px-6 overflow-hidden"
      style={{ backgroundColor: '#84913C' }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright olive/yellow-green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id="gradient1-screen5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#a0b968', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: '#84913C', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#a0b968', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient1-screen5)"
            style={{
              animation: 'morphWave1 11s ease-in-out infinite',
              animationDelay: '0s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,180 C350,220 450,140 850,180 C1150,210 1400,130 1700,170 C2000,200 2200,150 2400,180 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 2 - Medium olive */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '30%' }}>
          <defs>
            <linearGradient id="gradient2-screen5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#84913C', stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: '#5c6330', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#84913C', stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient2-screen5)"
            style={{
              animation: 'morphWave2 15s ease-in-out infinite',
              animationDelay: '-3s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,160 C280,200 520,110 820,150 C1180,190 1350,120 1650,160 C1950,200 2150,130 2400,150 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 3 - Dark olive */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '60%' }}>
          <defs>
            <linearGradient id="gradient3-screen5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#5c6330', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#3d4220', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#5c6330', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient3-screen5)"
            style={{
              animation: 'morphWave3 13s ease-in-out infinite',
              animationDelay: '-7s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,190 C320,230 550,150 850,190 C1100,220 1450,140 1750,180 C2050,210 2250,160 2400,190 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 4 - Very dark olive */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '90%' }}>
          <defs>
            <linearGradient id="gradient4-screen5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#3d4220', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: '#2a2d15', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: '#3d4220', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient4-screen5)"
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
        className={`relative z-10 text-white font-bold text-center text-lg mb-4 mt-24 px-4 transition-all duration-500 ${
          showHeader ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {t('screen5.topText')}
      </p>

      {/* Infographic circle */}
      <div className="relative z-10 mb-8">
        <div
          className={`relative w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-600 ${
            showCircle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
          style={{ backgroundColor: '#2DB288' }}
        >
          <div className="text-center z-10">
            <div className="text-white font-bold text-7xl leading-none">
              {animatedPoint}
            </div>
            <div className="text-white font-bold text-3xl mt-1">
              {t('screen5.points')}
            </div>
          </div>
        </div>
      </div>

      <div 
        className={`absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col transition-all duration-600 ${
          showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
        style={{ 
          height: '33%',
          backgroundColor: 'rgba(92, 99, 54, 1)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}
      >
        {/* Description Text */}
        <div className="w-full max-w-md mt-8 mb-6">
          <p className="text-white font-bold text-center text-lg leading-relaxed px-4">
            {totalPointPossibleRedeem > 0 
              ? t('screen5.description', { count: totalPointPossibleRedeem, productName: totalPointProductName })
              : t('screen5.noPointsDescription')
            }
          </p>
        </div>

        {/* Bubble circles */}
        <div className="flex justify-center items-center px-4">
          {Array.from({ length: totalPointPossibleRedeem }).map((_, index) => (
            <div
              key={index}
              className="relative rounded-full overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(92, 99, 54, 1)',
                border: '4px solid rgba(92, 99, 54, 1)',
                width: '50px',
                height: '50px',
                marginLeft: index === 0 ? '0' : '-18px',
                zIndex: totalPointPossibleRedeem - index,
              }}
            >
              <Image
                src={totalPointImage}
                alt={`Coffee ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
