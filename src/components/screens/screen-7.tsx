"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen7Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen7({ serverResponse, isActive = false }: Screen7Props) {
  const { t } = useTranslations();
  const favoriteStores = serverResponse?.listFavoriteStore || [];
  const displayStores = favoriteStores.slice(0, 3);

  const barColors = ['#2db288', '#a1b04a', '#27b5c8'];
  const [showHeader, setShowHeader] = useState(false);
  const [visibleBars, setVisibleBars] = useState<number[]>([]);
  const [visibleLabels, setVisibleLabels] = useState<number[]>([]);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowHeader(false);
      setVisibleBars([]);
      setVisibleLabels([]);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowHeader(true);
    displayStores.forEach((_, index) => {
      const barDelay = 220 + index * 180;
      const labelDelay = barDelay + 120;

      timers.push(
        setTimeout(() => {
          setVisibleBars(prev => (prev.includes(index) ? prev : [...prev, index]));
        }, barDelay),
      );

      timers.push(
        setTimeout(() => {
          setVisibleLabels(prev => (prev.includes(index) ? prev : [...prev, index]));
        }, labelDelay),
      );
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, displayStores]);

  const maxTransactions = useMemo(() => Math.max(...displayStores.map(s => s.transactionCount), 1), [displayStores]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center px-6 py-8"
      style={{ backgroundColor: 'rgba(26, 64, 52, 1)' }}
    >
      {/* Top Text */}
      <p
        className={`text-white font-bold text-center text-lg mb-8 mt-16 px-4 transition-all duration-500 ${
          showHeader ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {t('screen7.topText')}
      </p>

      {/* Bars */}
      <div className="w-full max-w-md flex items-end justify-center gap-4" style={{ height: '400px' }}>
        {displayStores.map((store, index) => {
          const barColor = barColors[index] || barColors[0];
          const barHeightPercentage = (store.transactionCount / maxTransactions) * 100;
          const minHeight = 120;
          const maxHeight = 300;
          const barHeight = minHeight + ((maxHeight - minHeight) * (barHeightPercentage / 100));
          const isVisible = visibleBars.includes(index);
          const transitionDelay = `${isVisible ? index * 140 : 0}ms`;

          return (
            <div
              key={index}
              className={`flex flex-col items-center relative transition-all duration-600 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                width: '100px',
                height: `${barHeight}px`,
                transitionDelay,
              }}
            >
              {/* Vertical Bar */}
              <div
                className="w-full rounded-lg flex flex-col items-center relative pt-3 pb-2"
                style={{ 
                  backgroundColor: barColor,
                  height: '100%',
                }}
              >
                {/* Circle Image */}
                <div className="absolute top-0" style={{ marginTop: '-52px' }}>
                  {store.storeImage ? (
                    <div 
                      className={`relative rounded-full overflow-hidden transition-all duration-500 ${
                        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      }`}
                      style={{
                        border: '10px solid rgba(0, 0, 0, 0.2)',
                        width: '80px',
                        height: '80px',
                      }}
                    >
                      <Image
                        src={store.storeImage}
                        alt={store.storeName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className={`relative rounded-full flex items-center justify-center transition-all duration-500 ${
                        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      }`}
                      style={{
                        border: '10px solid rgba(0, 0, 0, 0.2)',
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <span className="text-white font-bold text-xl">
                        {store.storeName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1" />

                {/* Store Name */}
                <div
                  className={`flex flex-col items-center px-2 mt-auto transition-all duration-400 ${
                    visibleLabels.includes(index)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  }`}
                >
                  <p className="text-white font-bold text-sm text-center leading-tight mb-1">
                    {store.storeName}
                  </p>
                  <p className="text-white/90 text-xs text-center">
                    {store.transactionCount} {t('screen7.transactions')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
