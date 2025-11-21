"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";
import { useEffect, useState } from "react";

interface Screen4Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen4({ serverResponse, isActive = false }: Screen4Props) {
  const { t } = useTranslations();
  const variantCount = serverResponse?.variantCount || 0;
  const isMoreThanFive = variantCount >= 5;

  const imageSrc = isMoreThanFive 
    ? '/stories-asset/slides04/slide04-more-five.jpg'
    : '/stories-asset/slides04/slide04-less-five.jpg';
  
  const buttonTextDescription = isMoreThanFive 
    ? t('screen4.tasteCurator')
    : t('screen4.signatureSeeker');
  
  const descriptionText = isMoreThanFive
    ? t('screen4.tasteCuratorDesc')
    : t('screen4.signatureSeekerDesc');

  const secondaryColor = '#00556c';

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
    timers.push(setTimeout(() => setShowImage(true), 200));
    timers.push(setTimeout(() => setShowButton(true), 450));
    timers.push(setTimeout(() => setShowDescription(true), 650));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ backgroundColor: '#006A87' }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright cyan/blue */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id="gradient1-screen4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#15a6ab', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: '#006A87', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#15a6ab', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient1-screen4)"
            style={{
              animation: 'morphWave1 11s ease-in-out infinite',
              animationDelay: '0s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,180 C350,220 450,140 850,180 C1150,210 1400,130 1700,170 C2000,200 2200,150 2400,180 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 2 - Medium blue */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '30%' }}>
          <defs>
            <linearGradient id="gradient2-screen4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#006A87', stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: '#00556c', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#006A87', stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient2-screen4)"
            style={{
              animation: 'morphWave2 15s ease-in-out infinite',
              animationDelay: '-3s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,160 C280,200 520,110 820,150 C1180,190 1350,120 1650,160 C1950,200 2150,130 2400,150 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 3 - Dark blue */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '60%' }}>
          <defs>
            <linearGradient id="gradient3-screen4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#00556c', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#003d4f', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#00556c', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient3-screen4)"
            style={{
              animation: 'morphWave3 13s ease-in-out infinite',
              animationDelay: '-7s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,190 C320,230 550,150 850,190 C1100,220 1450,140 1750,180 C2050,210 2250,160 2400,190 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 4 - Very dark blue */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '90%' }}>
          <defs>
            <linearGradient id="gradient4-screen4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#003d4f', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: '#002a35', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: '#003d4f', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient4-screen4)"
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
        className={`relative z-10 text-white font-bold text-center text-lg mb-8 mt-16 transition-all duration-500 ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {t('screen4.topText')}
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
            border: '14px solid rgba(0, 84, 107, 1)',
            width: '280px',
            height: '280px',
          }}
        >
          <Image
            src={imageSrc}
            alt={isMoreThanFive ? 'Taste Curator' : 'Signature Seeker'}
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
        style={{ backgroundColor: secondaryColor }}
      >
        <p className="text-white font-bold text-base text-center">
          {buttonTextDescription}
        </p>
      </div>

      {/* Description Text */}
      <p
        className={`text-white font-bold text-center text-lg px-4 transition-all duration-500 ${
          showDescription ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {descriptionText}
      </p>
    </div>
  );
}
