"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";
import { log } from "console";

interface Screen4Props {
  serverResponse?: ServerResponse;
}

export function Screen4({ serverResponse }: Screen4Props) {
  const variantCount = serverResponse?.variantCount || 0;
  console.log('variantCount', variantCount);
  const isMoreThanFive = variantCount >= 5;

  // Determine image and text based on variantCount
  const imageSrc = isMoreThanFive 
    ? '/stories-asset/slides04/slide04-more-five.jpg'
    : '/stories-asset/slides04/slide04-less-five.jpg';
  
  const buttonText = isMoreThanFive 
    ? 'The Taste Curator'
    : 'The Signature Seeker';
  
  const descriptionText = isMoreThanFive
    ? 'Si paling berani menjadi pertama untuk coba beragam rasa'
    : 'Si paling setia dengan menu sempurna andalannya!';

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#006A87' }}
    >
      {/* Top Text */}
      <p className="text-white font-bold text-center text-lg md:text-xl mb-8 mt-16">
        Tidak banyak yang tahu bahwa kamu adalah
      </p>

      {/* Circle Image with Border */}
      <div className="relative mb-6">
        <div 
          className="relative rounded-full overflow-hidden"
          style={{
            border: '10px solid rgba(0, 84, 107, 1)',
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

      {/* Description Text */}
      <p className="text-white font-bold text-center text-lg md:text-xl px-4">
        {descriptionText}
      </p>
    </div>
  );
}
