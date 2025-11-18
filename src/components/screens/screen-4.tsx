"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen4Props {
  serverResponse?: ServerResponse;
}

export function Screen4({ serverResponse }: Screen4Props) {
  const { t } = useTranslations();
  const variantCount = serverResponse?.variantCount || 0;
  const isMoreThanFive = variantCount >= 5;

  // Determine image and text based on variantCount
  const imageSrc = isMoreThanFive 
    ? '/stories-asset/slides04/slide04-more-five.jpg'
    : '/stories-asset/slides04/slide04-less-five.jpg';
  
  const buttonTextDescription = isMoreThanFive 
    ? t('screen4.tasteCurator')
    : t('screen4.signatureSeeker');
  
  const descriptionText = isMoreThanFive
    ? t('screen4.tasteCuratorDesc')
    : t('screen4.signatureSeekerDesc');

  const secondaryColor = '#00556c'

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#006A87' }}
    >
      {/* Top Text */}
      <p className="text-white font-bold text-center text-lg mb-8 mt-16">
        {t('screen4.topText')}
      </p>

      {/* Circle Image with Border */}
      <div className="relative mb-6">
        <div 
          className="relative rounded-full overflow-hidden"
            style={{
            border: '14px solid rgba(0, 84, 107, 1)',
            width: '280px',
            height: '280px',
          }}
        >
          <Image
            src={imageSrc}
            alt={isMoreThanFive ? 'Taste Curator' : 'Signature Seeker'}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Button with Title */}
      <div 
        className="px-6 py-3 rounded-full mb-4"
        style={{ backgroundColor: secondaryColor }}
            >
        <p className="text-white font-bold text-base text-center">
          {buttonTextDescription}
        </p>
      </div>

      {/* Description Text */}
      <p className="text-white font-bold text-center text-lg px-4">
        {descriptionText}
      </p>
    </div>
  );
}
