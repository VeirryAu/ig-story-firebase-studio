"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen12Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen12({ serverResponse, isActive = false }: Screen12Props) {
  const { t } = useTranslations();
  const circularImages = useMemo(
    () =>
      serverResponse?.listCircularImages ||
      Array(10)
        .fill(null)
        .map(
          (_, i) =>
            `https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop&crop=center`,
        ),
    [serverResponse],
  );

  const [showTop, setShowTop] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [showBottomText, setShowBottomText] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowTop(false);
      setShowCarousel(false);
      setShowBottomText(false);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowTop(true);
    timers.push(setTimeout(() => setShowCarousel(true), 250));
    timers.push(setTimeout(() => setShowBottomText(true), 500));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  return (
    <div 
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#C83E2B' }}
    >
      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1 pt-8 pb-4 mt-16">
        {/* Top Text */}
        <div
          className={`text-center mb-8 transition-all duration-500 ${
            showTop ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <p className="text-white font-bold text-xl mb-2">
            {t('screen12.topText1')}
          </p>
          <p className="text-white font-bold text-xl">
            {t('screen12.topText2')}
          </p>
        </div>

        {/* Bottom Card */}
        <div 
          className="absolute bottom-0 left-0 right-0 w-full flex flex-col"
          style={{ 
            height: '50%',
            backgroundColor: '#8d351a',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            zIndex: 10,
          }}
        >
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            {/* Animated Circular Images Container */}
            <div
              className={`relative w-full h-32 -mt-24 mb-8 overflow-hidden transition-all duration-600 ${
                showCarousel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <div className="absolute flex items-center gap-4 animate-slide-left">
                {circularImages.map((imageUrl, index) => (
                  <div
                    key={`first-${index}`}
                    className="relative flex-shrink-0"
                    style={{
                      width: '120px',
                      height: '120px',
                    }}
                  >
                    <div 
                      className="relative w-full h-full rounded-full overflow-hidden"
                      style={{
                        border: '8px solid rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Circular image ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index < 4}
                      />
                    </div>
                  </div>
                ))}
                {circularImages.map((imageUrl, index) => (
                  <div
                    key={`second-${index}`}
                    className="relative flex-shrink-0"
                    style={{
                      width: '120px',
                      height: '120px',
                    }}
                  >
                    <div 
                      className="relative w-full h-full rounded-full overflow-hidden"
                      style={{
                        border: '8px solid rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Circular image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Text */}
            <div
              className={`text-center mt-auto mb-32 transition-all duration-500 ${
                showBottomText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-white font-bold text-lg mb-1">
                {t('screen12.bottomText1')}
              </p>
              <p className="text-white font-bold text-lg mb-1">
                {t('screen12.bottomText2')}
              </p>
              <p className="text-white font-bold text-lg">
                {t('screen12.bottomText3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
