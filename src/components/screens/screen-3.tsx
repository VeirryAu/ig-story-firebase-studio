"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen3Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen3({ serverResponse, isActive = false }: Screen3Props) {
  const { t } = useTranslations();
  const trxCount = serverResponse?.trxCount || 0;
  const favoriteProducts = serverResponse?.listProductFavorite || [];

  const [showHeader, setShowHeader] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowHeader(false);
      setVisibleItems([]);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowHeader(true);

    favoriteProducts.forEach((_, index) => {
      const orderFromLowest = favoriteProducts.length - 1 - index;
      const delay = 250 + orderFromLowest * 140;
      const timer = setTimeout(() => {
        setVisibleItems(prev => (prev.includes(index) ? prev : [...prev, index]));
      }, delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, favoriteProducts]);

  return (
    <div 
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#C83E2B' }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright red/orange */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id="gradient1-screen3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#FF6B5A', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: '#C83E2B', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#FF6B5A', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient1-screen3)"
            style={{
              animation: 'morphWave1 11s ease-in-out infinite',
              animationDelay: '0s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,180 C350,220 450,140 850,180 C1150,210 1400,130 1700,170 C2000,200 2200,150 2400,180 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 2 - Medium red */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '30%' }}>
          <defs>
            <linearGradient id="gradient2-screen3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#C83E2B', stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: '#A54133', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#C83E2B', stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient2-screen3)"
            style={{
              animation: 'morphWave2 15s ease-in-out infinite',
              animationDelay: '-3s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,160 C280,200 520,110 820,150 C1180,190 1350,120 1650,160 C1950,200 2150,130 2400,150 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 3 - Dark red */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '60%' }}>
          <defs>
            <linearGradient id="gradient3-screen3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#A54133', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#8B2E1F', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#A54133', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient3-screen3)"
            style={{
              animation: 'morphWave3 13s ease-in-out infinite',
              animationDelay: '-7s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,190 C320,230 550,150 850,190 C1100,220 1450,140 1750,180 C2050,210 2250,160 2400,190 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 4 - Very dark red */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '90%' }}>
          <defs>
            <linearGradient id="gradient4-screen3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#8B2E1F', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: '#6B1F12', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: '#8B2E1F', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient4-screen3)"
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

      {/* Header Text */}
      <div className="relative z-10 px-6 pt-8 pb-4 mt-20 mb-10">
        <p
          className={`text-white font-bold text-center text-lg leading-relaxed transition-all duration-500 ${
            showHeader ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          {t('screen3.header', { trxCount })}
        </p>
      </div>

      {/* List of Product Cards */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-3">
        {favoriteProducts.map((product, index) => {
          const rank = index + 1;
          const isFirstRank = rank === 1;
          const cardBgColor = isFirstRank ? '#F45F49' : '#A54133';
          const isVisible = visibleItems.includes(index);
          const transitionDelay = `${isVisible ? index * 160 : 0}ms`;

          return (
            <div
              key={index}
              className={`w-full rounded-lg p-4 flex items-center gap-4 transform transition duration-700 ${
                isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-8 scale-95"
              }`}
              style={{ backgroundColor: cardBgColor, transitionDelay }}
            >
              {/* Image circle on left */}
              <div className="flex-shrink-0">
                {product.productImage ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={product.productImage}
                      alt={product.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <span className="text-white font-bold text-xl">
                      {product.productName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Name and Number of Cups */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base truncate">
                  {product.productName}
                </p>
                <p className="text-white/90 text-sm">
                  {product.countCups} {t('screen3.cup')}
                </p>
              </div>

              {/* Ranking */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {isFirstRank && (
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                )}
                <span className="text-white font-bold text-xl">
                  #{rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
