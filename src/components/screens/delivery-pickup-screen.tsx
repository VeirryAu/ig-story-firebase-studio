"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface DeliveryPickupScreenProps {
  serverResponse?: ServerResponse;
  isReversed?: boolean; // For screen-9 (reversed colors and different text)
  isActive?: boolean;
}

export function DeliveryPickupScreen({ serverResponse, isReversed = false, isActive = false }: DeliveryPickupScreenProps) {
  const { t } = useTranslations();
  const deliveryCount = serverResponse?.deliveryCount || 0;
  const pickupCount = serverResponse?.pickupCount || 0;
  const isDeliveryMore = deliveryCount > pickupCount;

  // Determine configuration based on condition and if reversed
  const config = (() => {
    if (isReversed) {
      // Screen-9: Reversed colors but same condition check
      if (isDeliveryMore) {
        // Delivery more than pickup - but use pickup colors (reversed)
        return {
          primaryBg: '#84913c',
          secondaryColor: '#707b38',
          topText: t('screen9.deliveryMore.topText'),
          buttonText: t('screen8.deliveryMore.buttonText', { deliveryCount }), // Still show delivery count
          imageSrc: '/stories-asset/slides08/slide-8-pickup.jpg', // Still pickup image
          cardText1: t('screen9.deliveryMore.cardText1'),
          cardText2: '', // Hidden
          additionalText: t('screen9.deliveryMore.additionalText'),
        };
      } else {
        // Pickup more than delivery - but use delivery colors (reversed)
        return {
          primaryBg: '#b44232',
          secondaryColor: '#7a3824',
          topText: t('screen9.pickupMore.topText'),
          buttonText: t('screen8.pickupMore.buttonText', { pickupCount }), // Still show pickup count
          imageSrc: '/stories-asset/slides08/slide-8-delivery.jpg', // Still delivery image
          cardText1: t('screen9.pickupMore.cardText1'),
          cardText2: '', // Hidden
          additionalText: t('screen9.pickupMore.additionalText'),
        };
      }
    } else {
      // Screen-8: Original colors and text
      if (isDeliveryMore) {
        // Delivery more than pickup
        return {
          primaryBg: '#b44232',
          secondaryColor: '#7a3824',
          topText: t('screen8.deliveryMore.topText'),
          imageSrc: '/stories-asset/slides08/slide-8-delivery.jpg',
          buttonText: t('screen8.deliveryMore.buttonText', { deliveryCount }),
          cardText1: t('screen8.deliveryMore.cardText1'),
          cardText2: t('screen8.deliveryMore.cardText2'),
          additionalText: '',
        };
      } else {
        // Pickup more than delivery
        return {
          primaryBg: '#84913c',
          secondaryColor: '#707b38',
          topText: t('screen8.pickupMore.topText'),
          imageSrc: '/stories-asset/slides08/slide-8-pickup.jpg',
          buttonText: t('screen8.pickupMore.buttonText', { pickupCount }),
          cardText1: t('screen8.pickupMore.cardText1'),
          cardText2: t('screen8.pickupMore.cardText2'),
          additionalText: '',
        };
      }
    }
  })();

  const [showTop, setShowTop] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowTop(false);
      setShowImage(false);
      setShowBottom(false);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowTop(true);
    timers.push(setTimeout(() => setShowImage(true), 200));
    timers.push(setTimeout(() => setShowBottom(true), 400));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  return (
    <div 
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: config.primaryBg }}
    >
      {/* Wavy background layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Bright variation */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '0%' }}>
          <defs>
            <linearGradient id={`gradient1-delivery-${isReversed ? 'rev' : 'norm'}-${isDeliveryMore ? 'del' : 'pick'}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: config.primaryBg === '#b44232' ? '#FF6B5A' : '#a0b968', stopOpacity: 1.0 }} />
              <stop offset="50%" style={{ stopColor: config.primaryBg, stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: config.primaryBg === '#b44232' ? '#FF6B5A' : '#a0b968', stopOpacity: 1.0 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#gradient1-delivery-${isReversed ? 'rev' : 'norm'}-${isDeliveryMore ? 'del' : 'pick'})`}
            style={{
              animation: 'morphWave1 11s ease-in-out infinite',
              animationDelay: '0s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,180 C350,220 450,140 850,180 C1150,210 1400,130 1700,170 C2000,200 2200,150 2400,180 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 2 - Medium variation */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '30%' }}>
          <defs>
            <linearGradient id={`gradient2-delivery-${isReversed ? 'rev' : 'norm'}-${isDeliveryMore ? 'del' : 'pick'}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: config.primaryBg, stopOpacity: 0.95 }} />
              <stop offset="50%" style={{ stopColor: config.secondaryColor, stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: config.primaryBg, stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#gradient2-delivery-${isReversed ? 'rev' : 'norm'}-${isDeliveryMore ? 'del' : 'pick'})`}
            style={{
              animation: 'morphWave2 15s ease-in-out infinite',
              animationDelay: '-3s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,160 C280,200 520,110 820,150 C1180,190 1350,120 1650,160 C1950,200 2150,130 2400,150 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 3 - Dark variation */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '60%' }}>
          <defs>
            <linearGradient id={`gradient3-delivery-${isReversed ? 'rev' : 'norm'}-${isDeliveryMore ? 'del' : 'pick'}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: config.secondaryColor, stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: config.primaryBg === '#b44232' ? '#5a1f14' : '#4a5a1f', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: config.secondaryColor, stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#gradient3-delivery-${isReversed ? 'rev' : 'norm'}-${isDeliveryMore ? 'del' : 'pick'})`}
            style={{
              animation: 'morphWave3 13s ease-in-out infinite',
              animationDelay: '-7s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,190 C320,230 550,150 850,190 C1100,220 1450,140 1750,180 C2050,210 2250,160 2400,190 L2400,320 L0,320 Z" 
          />
        </svg>
        
        {/* Wave 4 - Very dark variation */}
        <svg className="wave-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: '90%' }}>
          <defs>
            <linearGradient id={`gradient4-delivery-${isReversed ? 'rev' : 'norm'}-${isDeliveryMore ? 'del' : 'pick'}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: config.primaryBg === '#b44232' ? '#5a1f14' : '#4a5a1f', stopOpacity: 0.85 }} />
              <stop offset="50%" style={{ stopColor: config.primaryBg === '#b44232' ? '#3a140a' : '#2d350f', stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: config.primaryBg === '#b44232' ? '#5a1f14' : '#4a5a1f', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#gradient4-delivery-${isReversed ? 'rev' : 'norm'}-${isDeliveryMore ? 'del' : 'pick'})`}
            style={{
              animation: 'morphWave4 17s ease-in-out infinite',
              animationDelay: '-10s',
              animationPlayState: 'running',
              willChange: 'd'
            }}
            d="M0,170 C300,210 580,130 880,170 C1200,200 1420,150 1720,180 C2020,210 2220,140 2400,170 L2400,320 L0,320 Z" 
          />
        </svg>
      </div>

      {/* Top Text */}
      <div className="px-6 pt-8 pb-4 mt-16 relative z-10">
        <p
          className={`text-white font-bold text-center text-lg mb-6 transition-all duration-500 ${
            showTop ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          {config.topText}
        </p>

        {!isReversed && (
          <div
            className={`flex justify-center mb-6 transition-all duration-500 ${
              showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <div 
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: config.secondaryColor }}
            >
              <p className="text-white font-bold text-base">
                {config.buttonText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Circle Image */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
        }}
      >
        <div 
          className={`relative rounded-full overflow-hidden transition-all duration-600 ${
            showImage ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          style={{
            border: '10px solid rgba(0, 0, 0, 0.2)',
            width: '200px',
            height: '200px',
          }}
        >
          <Image
            src={config.imageSrc}
            alt={isDeliveryMore ? 'Delivery' : 'Pickup'}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Bottom Card */}
      <div 
        className={`absolute bottom-0 left-0 right-0 w-full flex flex-col transition-all duration-600 ${
          showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ 
          height: '50%',
          backgroundColor: config.secondaryColor,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          zIndex: 10,
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
          {config.cardText1 && (
            <p className="text-white font-bold text-lg mb-4 leading-relaxed">
              {config.cardText1}
            </p>
          )}

          {config.cardText2 && (
            <p className="text-white font-bold text-base leading-relaxed">
              {config.cardText2}
            </p>
          )}

          {config.additionalText && (
            <p 
              className="font-bold text-base mt-4"
              style={{ color: 'rgba(208, 215, 132, 1)' }}
            >
              {config.additionalText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

