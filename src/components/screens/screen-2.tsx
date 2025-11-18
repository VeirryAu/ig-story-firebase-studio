"use client";

import Image from "next/image";
import { useTranslations } from "@/hooks/use-translations";

interface Screen2Props {
  trxCount?: number;
}

export function Screen2({ trxCount = 0 }: Screen2Props) {
  const { t } = useTranslations();

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
        <p className="text-white font-bold text-center text-lg mt-16 mb-6">
          {t('screen2.topText')}
        </p>

        {/* Infographic circle with overflow logo */}
        <div className="relative mb-4">
          <div 
            className="relative w-52 h-52 rounded-full flex flex-col items-center justify-center"
            style={{ backgroundColor: '#2DB288' }}
          >
            {/* Number and Cups text */}
            <div className="text-center z-10">
              <div className="text-white font-bold text-7xl leading-none">
                {trxCount}
              </div>
              <div className="text-white font-bold text-md mt-1">
                {t('screen2.cups')}
              </div>
            </div>
          </div>
          
          {/* Overflow logo at bottom of circle */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20">
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
        <p className="text-white font-bold text-center text-sm px-4">
        </p>
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col"
        style={{ 
          height: '40%',
          backgroundColor: '#1A4034',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}
      >

        {/* Bottom half of card - Second text */}
        <div className="flex items-center justify-center px-6 pt-8 pb-6">
          <p className="text-white font-bold text-center text-lg leading-relaxed">
            {t('screen2.bottomText')}
          </p>
        </div>

        {/* Coffee journey decoration image below the text */}
        <div className="flex-1 relative w-full px-6 pb-6">
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

