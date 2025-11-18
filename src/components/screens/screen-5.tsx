"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen5Props {
  serverResponse?: ServerResponse;
}

export function Screen5({ serverResponse }: Screen5Props) {
  const { t } = useTranslations();
  const totalPoint = serverResponse?.totalPoint || 0;
  const totalPointDescription = serverResponse?.totalPointDescription || '';
  const totalPointPossibleRedeem = serverResponse?.totalPointPossibleRedeem || 0;
  const totalPointImage = serverResponse?.totalPointImage || 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&crop=center';

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center px-6"
      style={{ backgroundColor: '#84913C' }}
    >
      {/* Top Text */}
      <p className="text-white font-bold text-center text-lg mb-4 mt-24 px-4">
        {t('screen5.topText')}
      </p>

      {/* Infographic circle - similar to screen-2 but without logo */}
      <div className="relative mb-8">
        <div 
          className="relative w-52 h-52 rounded-full flex flex-col items-center justify-center"
          style={{ backgroundColor: '#2DB288' }}
        >
          {/* Number and Poin text */}
          <div className="text-center z-10">
            <div className="text-white font-bold text-7xl leading-none">
              {totalPoint}
            </div>
            <div className="text-white font-bold text-3xl mt-1">
              {t('screen5.points')}
            </div>
          </div>
        </div>
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col"
        style={{ 
          height: '33%',
          backgroundColor: 'rgba(92, 99, 54, 1)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}
      >

        {/* Description Text */}
        <div className="w-full max-w-md mt-8 mb-6">
          <p className="text-white font-bold text-center text-lg leading-relaxed px-4">
            {totalPointDescription}
          </p>
        </div>

        {/* Bubble circles - coffee latte images - horizontally stacked with 50% overlap */}
        <div className="flex justify-center items-center px-4">
          {Array.from({ length: totalPointPossibleRedeem }).map((_, index) => (
            <div
              key={index}
              className="relative rounded-full overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(92, 99, 54, 1)',
                border: '4px solid rgba(92, 99, 54, 1)',
                width: '50px',
                height: '50px',
                marginLeft: index === 0 ? '0' : '-18px', // Overlap by half (negative margin)
                zIndex: totalPointPossibleRedeem - index, // Later items on top
              }}
            >
              <Image
                src={totalPointImage}
                alt={`Coffee ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
