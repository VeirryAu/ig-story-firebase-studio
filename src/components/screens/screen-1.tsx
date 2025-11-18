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
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#84913C' }}>
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

