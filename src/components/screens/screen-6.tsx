"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "@/hooks/use-translations";

interface Screen6Props {
  isActive?: boolean;
}

export function Screen6({ isActive = false }: Screen6Props) {
  const { t } = useTranslations();
  
  // Determine time period based on local computer time
  const timePeriod = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours < 12) {
      return 'morning'; // Before 12 PM
    } else if (hours >= 12 && hours < 17) {
      return 'afternoon'; // 12 PM - 5 PM
    } else {
      return 'evening'; // After 5 PM
    }
  }, []);

  // Configuration based on time period
  const config = useMemo(() => {
    switch (timePeriod) {
      case 'morning':
        return {
          primaryBg: '#15a6ab',
          secondaryColor: '#118589',
          topText: t('screen6.morning.topText'),
          imageSrc: '/stories-asset/slides06/slide6-daybreakcatcher.jpg',
          buttonText: t('screen6.morning.buttonText'),
          descriptionText: t('screen6.morning.description'),
        };
      case 'afternoon':
        return {
          primaryBg: '#c8831c',
          secondaryColor: '#a06916',
          topText: t('screen6.afternoon.topText'),
          imageSrc: '/stories-asset/slides06/slide6-sunchaser.jpg',
          buttonText: t('screen6.afternoon.buttonText'),
          descriptionText: t('screen6.afternoon.description'),
        };
      case 'evening':
        return {
          primaryBg: '#533f8a',
          secondaryColor: '#42326e',
          topText: t('screen6.evening.topText'),
          imageSrc: '/stories-asset/slides06/slide6-twilightseeker.jpg',
          buttonText: t('screen6.evening.buttonText'),
          descriptionText: t('screen6.evening.description'),
        };
      default:
        return {
          primaryBg: '#15a6ab',
          secondaryColor: '#118589',
          topText: t('screen6.morning.topText'),
          imageSrc: '/stories-asset/slides06/slide6-daybreakcatcher.jpg',
          buttonText: t('screen6.morning.buttonText'),
          descriptionText: t('screen6.morning.description'),
        };
    }
  }, [timePeriod, t]);

  const [showTop, setShowTop] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowTop(false);
      setShowImage(false);
      setShowButton(false);
      setShowDescription(false);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowTop(true);
    timers.push(setTimeout(() => setShowImage(true), 220));
    timers.push(setTimeout(() => setShowButton(true), 420));
    timers.push(setTimeout(() => setShowDescription(true), 600));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ backgroundColor: config.primaryBg }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright variation */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id={`gradient1-screen6-${timePeriod}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: timePeriod === 'morning' ? '#4ECDC4' : timePeriod === 'afternoon' ? '#FFB84D' : '#8B7AB8', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: config.primaryBg, stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: timePeriod === 'morning' ? '#4ECDC4' : timePeriod === 'afternoon' ? '#FFB84D' : '#8B7AB8', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#gradient1-screen6-${timePeriod})`}
            style={{
              animation: 'morphWave1 11s ease-in-out infinite',
              animationDelay: '0s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,180 C350,220 450,140 850,180 C1150,210 1400,130 1700,170 C2000,200 2200,150 2400,180 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 2 - Medium variation */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '30%' }}>
          <defs>
            <linearGradient id={`gradient2-screen6-${timePeriod}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: config.primaryBg, stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: config.secondaryColor, stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: config.primaryBg, stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#gradient2-screen6-${timePeriod})`}
            style={{
              animation: 'morphWave2 15s ease-in-out infinite',
              animationDelay: '-3s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,160 C280,200 520,110 820,150 C1180,190 1350,120 1650,160 C1950,200 2150,130 2400,150 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 3 - Dark variation */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '60%' }}>
          <defs>
            <linearGradient id={`gradient3-screen6-${timePeriod}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: config.secondaryColor, stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: timePeriod === 'morning' ? '#0a5d61' : timePeriod === 'afternoon' ? '#7a4f0e' : '#352a52', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: config.secondaryColor, stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#gradient3-screen6-${timePeriod})`}
            style={{
              animation: 'morphWave3 13s ease-in-out infinite',
              animationDelay: '-7s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,190 C320,230 550,150 850,190 C1100,220 1450,140 1750,180 C2050,210 2250,160 2400,190 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 4 - Very dark variation */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '90%' }}>
          <defs>
            <linearGradient id={`gradient4-screen6-${timePeriod}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: timePeriod === 'morning' ? '#0a5d61' : timePeriod === 'afternoon' ? '#7a4f0e' : '#352a52', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: timePeriod === 'morning' ? '#053033' : timePeriod === 'afternoon' ? '#4d3009' : '#211a2f', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: timePeriod === 'morning' ? '#0a5d61' : timePeriod === 'afternoon' ? '#7a4f0e' : '#352a52', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#gradient4-screen6-${timePeriod})`}
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
          showTop ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {config.topText}
      </p>

      {/* Circle Image with Border */}
      <div
        className={`relative mb-6 transition-all duration-600 ${
          showImage ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <div 
          className="relative rounded-full overflow-hidden"
            style={{
            border: `14px solid ${config.secondaryColor}`,
            width: '280px',
            height: '280px',
            }}
          >
          <Image
            src={config.imageSrc}
            alt={config.buttonText}
            fill
            className="object-cover"
            priority
          />
          </div>
      </div>

      {/* Button with Title */}
      <div 
        className={`px-6 py-3 rounded-full mb-4 transition-all duration-500 ${
          showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ backgroundColor: config.secondaryColor }}
            >
        <p className="text-white font-bold text-base text-center">
          {config.buttonText}
        </p>
      </div>

      {/* Description Text */}
      <p
        className={`text-white font-bold text-center text-lg px-4 whitespace-pre-line transition-all duration-500 ${
          showDescription ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {config.descriptionText}
      </p>
    </div>
  );
}
