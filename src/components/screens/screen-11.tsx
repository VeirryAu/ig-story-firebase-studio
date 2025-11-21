"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen11Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen11({ serverResponse, isActive = false }: Screen11Props) {
  const { t } = useTranslations();
  const trxCount = serverResponse?.trxCount || 70;
  const totalPoint = serverResponse?.totalPoint || 450;
  const favoriteProduct = serverResponse?.listProductFavorite?.[0]?.productName || 'Aren Latte';
  const favoriteStore = serverResponse?.listFavoriteStore?.[0]?.storeName || 'Cikini';
  const totalSaving = serverResponse?.cheaperSubsDesc || 'Rp325rb';

  // Format the saving amount to remove "Rp" prefix if present and format it
  const formatSaving = (saving: string) => {
    return saving.replace(/^Rp\s*/i, '');
  };

  const cardOrder = useMemo(
    () => ['cups', 'points', 'favoriteProduct', 'favoriteStore', 'totalSaving'],
    [],
  );

  const [showHeader, setShowHeader] = useState(false);
  const [visibleCards, setVisibleCards] = useState<string[]>([]);
  const [showConclusion, setShowConclusion] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowHeader(false);
      setVisibleCards([]);
      setShowConclusion(false);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowHeader(true);
    cardOrder.forEach((id, index) => {
      const delay = 220 + index * 150;
      timers.push(
        setTimeout(() => {
          setVisibleCards(prev => (prev.includes(id) ? prev : [...prev, id]));
        }, delay),
      );
    });

    timers.push(
      setTimeout(() => setShowConclusion(true), 220 + cardOrder.length * 150 + 200),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, cardOrder]);

  const isCardVisible = (id: string) => visibleCards.includes(id);

  return (
    <div 
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#1A4034' }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright green */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id="gradient1-screen11" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#2DB288', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: '#1A4034', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#2DB288', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient1-screen11)"
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
            <linearGradient id="gradient2-screen11" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1A4034', stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: '#006041', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#1A4034', stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient2-screen11)"
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
            <linearGradient id="gradient3-screen11" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#006041', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#006041', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient3-screen11)"
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
            <linearGradient id="gradient4-screen11" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: '#081810', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: '#0F2A1F', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient4-screen11)"
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

      {/* Background Image - Always at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full"
        style={{ 
          height: '50%',
          zIndex: 1,
          opacity: 0.1,
        }}
      >
        <Image
          src="/stories-asset/slides11/slide11-bgasset.png"
          alt="Coffee journey background"
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col flex-1 px-6 pt-8 pb-4 mt-16">
        {/* Title */}
        <h1
          className={`text-white font-bold text-center text-md mb-8 transition-all duration-500 ${
            showHeader ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          {t('screen11.title')}
        </h1>

        {/* Data Cards Grid */}
        <div className="w-full max-w-md mx-auto space-y-4 mb-6">
          {/* Row 1: Total Cup and Total Poin */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Cup Dibeli */}
            <div 
              className={`rounded-2xl p-4 flex flex-col transition-all duration-500 ${
                isCardVisible('cups') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ backgroundColor: '#006041' }}
            >
              <p className="text-white font-bold text-xs text-center mb-2">
                {t('screen11.totalCupDibeli')}
              </p>
              <p 
                className="text-xl font-bold text-center"
                style={{ color: '#FFD700' }}
              >
                {trxCount}
              </p>
            </div>

            {/* Total Poin Didapat */}
            <div 
              className={`rounded-2xl p-4 flex flex-col transition-all duration-500 ${
                isCardVisible('points') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ backgroundColor: '#006041' }}
            >
              <p className="text-white font-bold text-xs text-center mb-2">
                {t('screen11.totalPoinDidapat')}
              </p>
              <p 
                className="text-xl font-bold text-center"
                style={{ color: '#FFD700' }}
              >
                {totalPoint}
              </p>
            </div>
          </div>

          {/* Row 2: Menu Terfavorit (Full Width) */}
          <div 
            className={`rounded-2xl p-4 flex flex-col transition-all duration-500 ${
              isCardVisible('favoriteProduct') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ backgroundColor: '#006041' }}
          >
            <p className="text-white font-bold text-xs text-center mb-2">
              {t('screen11.menuTerfavorit')}
            </p>
            <p 
              className="text-xl font-bold text-center"
              style={{ color: '#FFD700' }}
            >
              {favoriteProduct}
            </p>
          </div>

          {/* Row 3: Store Terfavorit and Total Saving */}
          <div className="grid grid-cols-2 gap-4">
            {/* Store Terfavorit */}
            <div 
              className={`rounded-2xl p-4 flex flex-col transition-all duration-500 ${
                isCardVisible('favoriteStore') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ backgroundColor: '#006041' }}
            >
              <p className="text-white font-bold text-xs text-center mb-2">
                {t('screen11.storeTerfavorit')}
              </p>
              <p 
                className="text-md font-bold text-center"
                style={{ color: '#FFD700' }}
              >
                {favoriteStore}
              </p>
            </div>

            {/* Total Saving */}
            <div 
              className={`rounded-2xl p-4 flex flex-col transition-all duration-500 ${
                isCardVisible('totalSaving') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ backgroundColor: '#006041' }}
            >
              <p className="text-white font-bold text-xs text-center mb-2">
                {t('screen11.totalSaving')}
              </p>
              <p 
                className="text-md font-bold text-center"
                style={{ color: '#FFD700' }}
              >
                {formatSaving(totalSaving)}
              </p>
            </div>
          </div>
        </div>

        {/* Concluding Message */}
        <div className="w-full max-w-md mx-auto mt-4 mb-6">
          <p
            className={`text-white font-bold text-center text-base transition-all duration-500 ${
              showConclusion ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {t('screen11.conclusion')}
          </p>
        </div>
      </div>
    </div>
  );
}
