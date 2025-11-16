"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";

interface DeliveryPickupScreenProps {
  serverResponse?: ServerResponse;
  isReversed?: boolean; // For screen-9 (reversed colors and different text)
}

export function DeliveryPickupScreen({ serverResponse, isReversed = false }: DeliveryPickupScreenProps) {
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
          topText: 'Selain delivery, pick up juga gak kalah seru lho!',
          buttonText: `Total ${deliveryCount}x transaksi`, // Still show delivery count
          imageSrc: '/stories-asset/slides08/slide-8-pickup.jpg', // Still pickup image
          cardText1: 'Pesan kopi tanpa antre di store yang nyaman dan barista kami yang ramah siap menyapamu!',
          cardText2: '', // Hidden
          additionalText: '2026 jangan lupa ke store Fore juga ya!',
        };
      } else {
        // Pickup more than delivery - but use delivery colors (reversed)
        return {
          primaryBg: '#b44232',
          secondaryColor: '#7a3824',
          topText: 'Selain pick up, ada opsi delivery yang gak kalah nyaman, lho!',
          buttonText: `Total ${pickupCount}x transaksi`, // Still show pickup count
          imageSrc: '/stories-asset/slides08/slide-8-delivery.jpg', // Still delivery image
          cardText1: 'Ada mitra yang siap dan sigap mengantarkan kopi favoritmu tepat waktu sampai tujuan!',
          cardText2: '', // Hidden
          additionalText: 'Sstt.. ada potongan harganya, lho!',
        };
      }
    } else {
      // Screen-8: Original colors and text
      if (isDeliveryMore) {
        // Delivery more than pickup
        return {
          primaryBg: '#b44232',
          secondaryColor: '#7a3824',
          topText: 'Selain pick up, ada opsi delivery yang gak kalah nyaman, lho!',
          imageSrc: '/stories-asset/slides08/slide-8-delivery.jpg',
          buttonText: `Total ${deliveryCount}x transaksi`,
          cardText1: 'Wah, kamu act of service banget, ya?',
          cardText2: 'Memang, paling nyaman kalo ada yang bantu mengantarkan pesanan favoritmu!',
          additionalText: '',
        };
      } else {
        // Pickup more than delivery
        return {
          primaryBg: '#84913c',
          secondaryColor: '#707b38',
          topText: 'Kami tahu, kamu sering memilih pick up langsung di store!',
          imageSrc: '/stories-asset/slides08/slide-8-pickup.jpg',
          buttonText: `Total ${pickupCount}x transaksi`,
          cardText1: 'Kamu pasti perlu quality time, ya?',
          cardText2: 'Store Fore memang nyaman buat kamu yang suka menghabiskan waktu berkualitas!',
          additionalText: '',
        };
      }
    }
  })();

  return (
    <div 
      className="relative w-full h-full flex flex-col"
      style={{ backgroundColor: config.primaryBg }}
    >
      {/* Top Text */}
      <div className="px-6 pt-8 pb-4 mt-16 relative z-10">
        <p className="text-white font-bold text-center text-lg mb-6">
          {config.topText}
        </p>

        {/* Button with transaction count - hidden when reversed (screen-9) */}
        {!isReversed && (
          <div className="flex justify-center mb-6">
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

      {/* Circle Image - positioned in front of all elements */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
        }}
      >
        <div 
          className="relative rounded-full overflow-hidden"
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

      {/* Bottom Card - half of the screen */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full flex flex-col"
        style={{ 
          height: '50%',
          backgroundColor: config.secondaryColor,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          zIndex: 10,
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          {/* Card Text 1 */}
          {config.cardText1 && (
            <p className="text-white font-bold text-center text-lg mb-4 leading-relaxed">
              {config.cardText1}
            </p>
          )}

          {/* Card Text 2 */}
          {config.cardText2 && (
            <p className="text-white font-bold text-center text-base leading-relaxed">
              {config.cardText2}
            </p>
          )}

          {/* Additional Text (for screen-9) */}
          {config.additionalText && (
            <p 
              className="font-bold text-center text-base mt-4"
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

