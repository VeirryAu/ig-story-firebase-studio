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
      className="relative w-full h-full flex flex-col items-center px-6"
      style={{ backgroundColor: '#84913C' }}
    >
      {/* Top Text */}
      <p
        className={`text-white font-bold text-center text-lg mb-4 mt-24 px-4 transition-all duration-500 ${
          showHeader ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {t('screen5.topText')}
      </p>

      {/* Infographic circle */}
      <div className="relative mb-8">
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
