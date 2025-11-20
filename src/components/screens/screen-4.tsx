"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";
import { useEffect, useState } from "react";

interface Screen4Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen4({ serverResponse, isActive = false }: Screen4Props) {
  const { t } = useTranslations();
  const variantCount = serverResponse?.variantCount || 0;
  const isMoreThanFive = variantCount >= 5;

  const imageSrc = isMoreThanFive 
    ? '/stories-asset/slides04/slide04-more-five.jpg'
    : '/stories-asset/slides04/slide04-less-five.jpg';
  
  const buttonTextDescription = isMoreThanFive 
    ? t('screen4.tasteCurator')
    : t('screen4.signatureSeeker');
  
  const descriptionText = isMoreThanFive
    ? t('screen4.tasteCuratorDesc')
    : t('screen4.signatureSeekerDesc');

  const secondaryColor = '#00556c';

  const [showTop, setShowTop] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowTop(false);
      setShowImage(false);
      setShowButton(false);
      setShowDescription(false);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowTop(true);
    timers.push(setTimeout(() => setShowImage(true), 200));
    timers.push(setTimeout(() => setShowButton(true), 450));
    timers.push(setTimeout(() => setShowDescription(true), 650));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#006A87' }}
    >
      {/* Top Text */}
      <p
        className={`text-white font-bold text-center text-lg mb-8 mt-16 transition-all duration-500 ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {t('screen4.topText')}
      </p>

      {/* Circle Image with Border */}
      <div
        className={`relative mb-6 transition-all duration-600 ${
          showImage ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
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
        className={`px-6 py-3 rounded-full mb-4 transition-all duration-500 ${
          showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ backgroundColor: secondaryColor }}
      >
        <p className="text-white font-bold text-base text-center">
          {buttonTextDescription}
        </p>
      </div>

      {/* Description Text */}
      <p
        className={`text-white font-bold text-center text-lg px-4 transition-all duration-500 ${
          showDescription ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {descriptionText}
      </p>
    </div>
  );
}
