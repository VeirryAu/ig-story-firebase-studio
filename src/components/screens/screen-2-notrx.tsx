"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/use-translations";

interface Screen2NoTrxProps {
  onShopClick?: () => void;
}

export function Screen2NoTrx({ onShopClick }: Screen2NoTrxProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#006041' }}
    >
        {/* Top half of card - First text */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 mb-80">
          <p className="text-white font-bold text-center text-lg leading-relaxed whitespace-pre-line">
            {t('screen2Notrx.topText')}
          </p>
        </div>
      {/* Card - half of the screen */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col"
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

        {/* Button at the bottom */}
        <div className="w-full flex justify-center pb-6 pt-2">
          <button
            className="px-8 py-3 rounded-full font-bold text-sm transition-transform active:scale-95 mb-32"
            style={{ 
              backgroundColor: '#FFFFFF',
              color: '#006041'
            }}
            onClick={() => {
              onShopClick?.();
            }}
          >
            {t('screen2Notrx.button')}
          </button>
        </div>
      </div>
    </div>
  );
}

