"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "@/hooks/use-translations";

export function Screen6() {
  const { t } = useTranslations();
  
  // Determine time period based on local computer time
  const timePeriod = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours < 12) {
      return 'morning'; // Before 12 PM
    } else if (hours >= 12 && hours < 17) {
      return 'afternoon'; // 12 PM - 5 PM
    } else {
      return 'evening'; // After 5 PM
    }
  }, []);

  // Configuration based on time period
  const config = useMemo(() => {
    switch (timePeriod) {
      case 'morning':
        return {
          primaryBg: '#15a6ab',
          secondaryColor: '#118589',
          topText: t('screen6.morning.topText'),
          imageSrc: '/stories-asset/slides06/slide6-daybreakcatcher.jpg',
          buttonText: t('screen6.morning.buttonText'),
          descriptionText: t('screen6.morning.description'),
        };
      case 'afternoon':
        return {
          primaryBg: '#c8831c',
          secondaryColor: '#a06916',
          topText: t('screen6.afternoon.topText'),
          imageSrc: '/stories-asset/slides06/slide6-sunchaser.jpg',
          buttonText: t('screen6.afternoon.buttonText'),
          descriptionText: t('screen6.afternoon.description'),
        };
      case 'evening':
        return {
          primaryBg: '#533f8a',
          secondaryColor: '#42326e',
          topText: t('screen6.evening.topText'),
          imageSrc: '/stories-asset/slides06/slide6-twilightseeker.jpg',
          buttonText: t('screen6.evening.buttonText'),
          descriptionText: t('screen6.evening.description'),
        };
      default:
        return {
          primaryBg: '#15a6ab',
          secondaryColor: '#118589',
          topText: t('screen6.morning.topText'),
          imageSrc: '/stories-asset/slides06/slide6-daybreakcatcher.jpg',
          buttonText: t('screen6.morning.buttonText'),
          descriptionText: t('screen6.morning.description'),
        };
    }
  }, [timePeriod, t]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: config.primaryBg }}
    >
      {/* Top Text */}
      <p className="text-white font-bold text-center text-lg mb-8 mt-16 px-4">
        {config.topText}
      </p>

      {/* Circle Image with Border */}
      <div className="relative mb-6">
        <div 
          className="relative rounded-full overflow-hidden"
            style={{
            border: `14px solid ${config.secondaryColor}`,
            width: '280px',
            height: '280px',
            }}
          >
          <Image
            src={config.imageSrc}
            alt={config.buttonText}
            fill
            className="object-cover"
            priority
          />
          </div>
      </div>

      {/* Button with Title */}
      <div 
        className="px-6 py-3 rounded-full mb-4"
        style={{ backgroundColor: config.secondaryColor }}
            >
        <p className="text-white font-bold text-base text-center">
          {config.buttonText}
        </p>
      </div>

      {/* Description Text */}
      <p className="text-white font-bold text-center text-lg px-4 whitespace-pre-line">
        {config.descriptionText}
      </p>
    </div>
  );
}
