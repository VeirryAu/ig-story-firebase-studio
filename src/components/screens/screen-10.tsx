"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen10Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen10({ serverResponse, isActive = false }: Screen10Props) {
  const { t, locale } = useTranslations();
  const userName = serverResponse?.userName || 'User';
  const cheaperSubsDesc = serverResponse?.cheaperSubsDesc || '325rb Rupiah';
  const cheaperSubsAmount = serverResponse?.cheaperSubsAmount || 325500;
  const topRanking = serverResponse?.topRanking || 50;

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-SG').format(amount);

  const blurredTop = useMemo(() => Array.from({ length: 3 }), []);
  const blurredBottom = useMemo(() => Array.from({ length: 2 }), []);

  const [showHeader, setShowHeader] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [visibleListItems, setVisibleListItems] = useState<number[]>([]);
  const [showBottomCard, setShowBottomCard] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowHeader(false);
      setShowSavings(false);
      setVisibleListItems([]);
      setShowBottomCard(false);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowHeader(true);
    timers.push(setTimeout(() => setShowSavings(true), 200));

    const listDelays = [
      ...blurredTop.map((_, idx) => 350 + idx * 120),
      350 + blurredTop.length * 120 + 120, // highlighted entry
      ...blurredBottom.map((_, idx) => 350 + blurredTop.length * 120 + 240 + idx * 120),
    ];

    listDelays.forEach((delay, idx) => {
      timers.push(
        setTimeout(() => {
          setVisibleListItems(prev => (prev.includes(idx) ? prev : [...prev, idx]));
        }, delay),
      );
    });

    timers.push(setTimeout(() => setShowBottomCard(true), 350 + listDelays.length * 120));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, blurredTop.length, blurredBottom.length]);

  return (
    <div 
      className="relative w-full h-full flex flex-col"
      style={{ backgroundColor: '#006A87' }}
    >
      {/* Top Section with Headline */}
      <div className="px-6 pt-8 pb-4 mt-16 relative z-10">
        <div
          className={`flex items-center justify-center gap-2 mb-4 transition-all duration-500 ${
            showHeader ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <p className="text-white font-bold text-lg">{t('screen10.pakai')}</p>
          <div className="relative">
            <Image
              src="/stories-asset/slides10/slide10-myforeplan.png"
              alt="my FORE Plan"
              width={70}
              height={23.3}
              className="h-6 w-auto"
              priority
            />
          </div>
        </div>

        <p
          className={`text-white font-bold text-center text-lg mb-6 transition-all duration-500 ${
            showHeader ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          {t('screen10.bikinHemat')}
        </p>

        {/* Savings Button */}
        <div
          className={`flex justify-center mb-8 transition-all duration-500 ${
            showSavings ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
          }`}
        >
          <div
            className="px-8 py-4 rounded-full"
            style={{ backgroundColor: '#15a6ab' }}
          >
            <p className="text-white font-bold text-2xl">
              {cheaperSubsDesc}
            </p>
          </div>
        </div>

        {/* User List Section */}
        <div className="w-full max-w-md mx-auto space-y-2 mb-6">
          {blurredTop.map((_, index) => (
            <div
              key={`blurred-${index}`}
              className={`w-full rounded-lg p-3 opacity-30 blur-sm transition-all duration-500 ${
                visibleListItems.includes(index) ? "opacity-40 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
              style={{ backgroundColor: '#15a6ab' }}
            >
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-white/50 rounded"></div>
                <div className="w-32 h-4 bg-white/50 rounded"></div>
              </div>
            </div>
          ))}

          {/* Highlighted User Entry */}
          <div
            className={`w-full rounded-lg p-4 transition-all duration-500 ${
              visibleListItems.includes(blurredTop.length)
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4"
            }`}
            style={{ backgroundColor: '#15a6ab' }}
          >
            <div className="flex justify-between items-center">
              <p className="text-white font-bold text-base">
                {userName}
              </p>
              <p className="text-white font-bold text-base">
                {t('screen10.hematRp', { amount: formatAmount(cheaperSubsAmount) })}
              </p>
            </div>
          </div>

          {/* More blurred entries */}
          {blurredBottom.map((_, index) => {
            const itemIndex = blurredTop.length + 1 + index;
            return (
              <div
                key={`blurred-bottom-${index}`}
                className={`w-full rounded-lg p-3 opacity-30 blur-sm transition-all duration-500 ${
                  visibleListItems.includes(itemIndex) ? "opacity-40 translate-x-0" : "opacity-0 translate-x-4"
                }`}
                style={{ backgroundColor: '#15a6ab' }}
              >
                <div className="flex justify-between items-center">
                  <div className="w-24 h-4 bg-white/50 rounded"></div>
                  <div className="w-32 h-4 bg-white/50 rounded"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Card */}
      <div
        className={`absolute bottom-0 left-0 right-0 w-full flex flex-col transition-all duration-600 ${
          showBottomCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{
          height: '20%',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          zIndex: 10,
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
          <p className="text-white font-bold text-center text-base leading-relaxed mb-64">
            {(() => {
              const text = t('screen10.bottomText', { ranking: topRanking });
              const marker = `top ${topRanking}`;
              const parts = text.split(marker);
              if (parts.length === 2) {
                return (
                  <>
                    {parts[0]}
                    <span
                      className="px-2 py-1 inline-block"
                      style={{
                        backgroundColor: 'rgba(39, 181, 200, 1)',
                        transform: 'rotate(-5.28deg)',
                      }}
                    >
                      top {topRanking}
                    </span>
                    {parts[1]}
                  </>
                );
              }
              return text;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
