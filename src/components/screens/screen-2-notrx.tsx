"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/use-translations";

interface Screen2NoTrxProps {
  isActive?: boolean;
}

export function Screen2NoTrx({ isActive = false }: Screen2NoTrxProps) {
  const { t } = useTranslations();
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowTop(false);
      setShowBottom(false);
      return;
    }

    setShowTop(true);
    const bottomTimer = setTimeout(() => setShowBottom(true), 250);

    return () => clearTimeout(bottomTimer);
  }, [isActive]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#006041' }}
    >
        {/* Top half of card - First text */}
        <div 
          className={`flex-1 flex items-center justify-center px-6 py-8 mb-80 transition-all duration-600 ${
            showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-white font-bold text-center text-lg leading-relaxed whitespace-pre-line">
            {t('screen2Notrx.topText')}
          </p>
        </div>
      {/* Card - half of the screen */}
      <div 
        className={`absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col transition-all duration-600 ${
          showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ 
          backgroundColor: '#1A4034',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}
      >

        {/* Bottom half of card - Second text */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <p className="text-white font-bold text-center text-lg leading-relaxed">
            {t('screen2Notrx.bottomText')}
          </p>
        </div>

        {/* Button removed - now handled in story-viewer.tsx */}
      </div>
    </div>
  );
}

