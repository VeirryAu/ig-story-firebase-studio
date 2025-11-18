"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen12Props {
  serverResponse?: ServerResponse;
}

export function Screen12({ serverResponse }: Screen12Props) {
  const { t } = useTranslations();
  // Get circular images from serverResponse, default to 10 placeholder images
  const circularImages = serverResponse?.listCircularImages || Array(10).fill(null).map((_, i) => 
    `https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop&crop=center`
  );

  return (
    <div 
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#C83E2B' }}
    >
      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1 pt-8 pb-4 mt-16">
        {/* Top Text */}
        <div className="text-center mb-8">
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
        <div className="relative w-full h-32 -mt-24 mb-8 overflow-hidden">
          <div className="absolute flex items-center gap-4 animate-slide-left">
            {/* First set of images */}
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
            {/* Duplicate set for seamless loop */}
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
        <div className="text-center mt-auto mb-32">
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
