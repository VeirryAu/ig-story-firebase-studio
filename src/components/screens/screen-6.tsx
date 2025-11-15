"use client";

import { useMemo } from "react";
import Image from "next/image";

export function Screen6() {
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
          topText: 'Always your go-to, day or night. kamu suka memesan sebelum jam 12 siang, itu artinya kamu…',
          imageSrc: '/stories-asset/slides06/slide6-daybreakcatcher.jpg',
          buttonText: 'Daybreak Catcher',
          descriptionText: 'Energi fresh di pagi hari jadi bekal buat aktivitas seharian.\nJust rise and sip!',
        };
      case 'afternoon':
        return {
          primaryBg: '#c8831c',
          secondaryColor: '#a06916',
          topText: 'Always your go-to, day or night. kamu suka memesan sesudah jam 12 siang, itu artinya kamu…',
          imageSrc: '/stories-asset/slides06/slide6-sunchaser.jpg',
          buttonText: 'Sun Chaser',
          descriptionText: 'Kopi selalu jadi teman ngejar semangat siang sampai sore.\nStay glowing all day!',
        };
      case 'evening':
        return {
          primaryBg: '#533f8a',
          secondaryColor: '#42326e',
          topText: 'Always your go-to, day or night. kamu suka memesan sesudah jam 6 sore, itu artinya kamu…',
          imageSrc: '/stories-asset/slides06/slide6-twilightseeker.jpg',
          buttonText: 'Twilight Seeker',
          descriptionText: 'Ngopi buatmu jadi ritual penutup hari.  Chill mode: ON',
        };
      default:
        return {
          primaryBg: '#15a6ab',
          secondaryColor: '#118589',
          topText: 'Always your go-to, day or night. kamu suka memesan sebelum jam 12 siang, itu artinya kamu…',
          imageSrc: '/stories-asset/slides06/slide6-daybreakcatcher.jpg',
          buttonText: 'Daybreak Catcher',
          descriptionText: 'Energi fresh di pagi hari jadi bekal buat aktivitas seharian.\nJust rise and sip!',
        };
    }
  }, [timePeriod]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: config.primaryBg }}
    >
      {/* Top Text */}
      <p className="text-white font-bold text-center text-lg md:text-xl mb-8 mt-16 px-4">
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
        <p className="text-white font-bold text-base md:text-lg text-center">
          {config.buttonText}
        </p>
      </div>

      {/* Description Text */}
      <p className="text-white font-bold text-center text-lg md:text-xl px-4 whitespace-pre-line">
        {config.descriptionText}
      </p>
    </div>
  );
}
