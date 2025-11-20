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
      className="relative w-full h-full flex flex-col"
      style={{ backgroundColor: config.primaryBg }}
    >
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

