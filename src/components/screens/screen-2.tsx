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
      className="relative w-full h-full flex flex-col"
      style={{ backgroundColor: '#1F935C' }}
    >
      {/* Card - 1/3 of the screen */}
      <div 
        className="relative w-full flex flex-col items-center px-6 pt-8 pb-12 overflow-visible"
            style={{
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
        className={`absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col transition-all duration-600 ${
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

