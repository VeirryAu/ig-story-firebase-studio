"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";

interface Screen10Props {
  serverResponse?: ServerResponse;
}

export function Screen10({ serverResponse }: Screen10Props) {
  const userName = serverResponse?.userName || 'User';
  const cheaperSubsDesc = serverResponse?.cheaperSubsDesc || '325rb Rupiah';
  const cheaperSubsAmount = serverResponse?.cheaperSubsAmount || 325500;
  const topRanking = serverResponse?.topRanking || 50;

  // Format the amount for display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col"
      style={{ backgroundColor: '#006A87' }}
    >
      {/* Top Section with Headline */}
      <div className="px-6 pt-8 pb-4 mt-16 relative z-10">
        {/* Pakai my FORE Plan */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <p className="text-white font-bold text-lg md:text-xl">Pakai</p>
          <div className="relative">
            <Image
              src="/stories-asset/slides10/slide10-myforeplan.png"
              alt="my FORE Plan"
              width={70}
              height={23.3}
              className="h-6 md:h-7 w-auto"
              priority
            />
          </div>
        </div>

        {/* bikin kamu hemat sebanyak */}
        <p className="text-white font-bold text-center text-lg md:text-xl mb-6">
          bikin kamu hemat sebanyak
        </p>

        {/* Savings Button */}
        <div className="flex justify-center mb-8">
          <div 
            className="px-8 py-4 rounded-full"
            style={{ backgroundColor: '#15a6ab' }}
          >
            <p className="text-white font-bold text-2xl md:text-3xl">
              {cheaperSubsDesc}
            </p>
          </div>
        </div>

        {/* User List Section */}
        <div className="w-full max-w-md mx-auto space-y-2 mb-6">
          {/* Blurred entries (other users) */}
          {[...Array(3)].map((_, index) => (
            <div
              key={`blurred-${index}`}
              className="w-full rounded-lg p-3 opacity-30 blur-sm"
              style={{ backgroundColor: '#15a6ab' }}
            >
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-white/50 rounded"></div>
                <div className="w-32 h-4 bg-white/50 rounded"></div>
              </div>
            </div>
          ))}

          {/* Highlighted User Entry */}
          <div 
            className="w-full rounded-lg p-4"
            style={{ backgroundColor: '#15a6ab' }}
          >
            <div className="flex justify-between items-center">
              <p className="text-white font-bold text-base md:text-lg">
                {userName}
              </p>
              <p className="text-white font-bold text-base md:text-lg">
                Hemat Rp {formatAmount(cheaperSubsAmount)}
              </p>
            </div>
          </div>

          {/* More blurred entries */}
          {[...Array(2)].map((_, index) => (
            <div
              key={`blurred-bottom-${index}`}
              className="w-full rounded-lg p-3 opacity-30 blur-sm"
              style={{ backgroundColor: '#15a6ab' }}
            >
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-white/50 rounded"></div>
                <div className="w-32 h-4 bg-white/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Card with Congratulatory Message */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full flex flex-col"
        style={{ 
          height: '20%',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          zIndex: 10,
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
          <p className="text-white font-bold text-center text-base md:text-lg leading-relaxed">
            Wow! Kamu berada di{' '}
            <span 
              className="px-2 py-1 inline-block"
              style={{ 
                backgroundColor: 'rgba(39, 181, 200, 1)',
                transform: 'rotate(-5.28deg)',
              }}
            >
              top {topRanking}
            </span>
            {' '}most saving dari puluhan ribu pengguna MyFore Plan lainnya.
          </p>
        </div>
      </div>
    </div>
  );
}
