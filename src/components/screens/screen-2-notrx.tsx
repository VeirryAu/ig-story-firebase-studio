"use client";

import { useEffect, useState } from "react";

export function Screen2NoTrx() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#006041' }}
    >
        {/* Top half of card - First text */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 mb-80">
          <p className="text-white font-bold text-center text-lg md:text-xl leading-relaxed">
            Wah, sayang sekali..<br />
            Kamu belum ada recap karena selama 2025 kamu belum melakukan pembelian cup Fore apapun 😔
          </p>
        </div>
      {/* Card - half of the screen */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full h-1/2 flex flex-col"
        style={{ 
          backgroundColor: '#1A4034',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}
      >

        {/* Bottom half of card - Second text */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <p className="text-white font-bold text-center text-lg md:text-xl leading-relaxed">
            Yuk belanja sekarang dan rasain keuntungan menggunakan aplikasi Fore Coffee bareng jutaan Fore Friends lainnya!
          </p>
        </div>

        {/* Button at the bottom */}
        <div className="w-full flex justify-center pb-6 pt-2">
          <button
            className="px-8 py-3 rounded-full font-bold text-sm md:text-base transition-transform active:scale-95 mb-32"
            style={{ 
              backgroundColor: '#FFFFFF',
              color: '#006041'
            }}
            onClick={() => {
              // TODO: Add navigation to shop page
              console.log('Navigate to shop');
            }}
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

