"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";

interface Screen7Props {
  serverResponse?: ServerResponse;
}

export function Screen7({ serverResponse }: Screen7Props) {
  const favoriteStores = serverResponse?.listFavoriteStore || [];
  // Limit to max 3 stores
  const displayStores = favoriteStores.slice(0, 3);

  // Bar colors for each position
  const barColors = ['#2db288', '#a1b04a', '#27b5c8'];

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center px-6 py-8"
      style={{ backgroundColor: 'rgba(26, 64, 52, 1)' }}
    >
      {/* Top Text */}
      <p className="text-white font-bold text-center text-lg mb-8 mt-16 px-4">
        Dari 300 store yang tersebar di Indonesia dan Singapura, berikut 3 tempat yang jadi favorit kamu
      </p>

      {/* 3 bars of infographic - vertical bar graph style */}
      <div className="w-full max-w-md flex items-end justify-center gap-4" style={{ height: '400px' }}>
        {displayStores.map((store, index) => {
          const barColor = barColors[index] || barColors[0];
          // Calculate bar height based on transaction count (relative to max)
          const maxTransactions = Math.max(...displayStores.map(s => s.transactionCount), 1);
          const barHeightPercentage = (store.transactionCount / maxTransactions) * 100;
          const minHeight = 120; // Minimum bar height in pixels
          const maxHeight = 300; // Maximum bar height in pixels
          const barHeight = minHeight + ((maxHeight - minHeight) * (barHeightPercentage / 100));
          
          return (
            <div
              key={index}
              className="flex flex-col items-center relative"
              style={{ 
                width: '100px',
                height: `${barHeight}px`,
              }}
            >
              {/* Vertical Bar */}
              <div
                className="w-full rounded-lg flex flex-col items-center relative pt-3 pb-2"
                style={{ 
                  backgroundColor: barColor,
                  height: '100%',
                }}
              >
                {/* Circle Image of store with border at top */}
                <div className="absolute top-0" style={{ marginTop: '-52px' }}>
                  {store.storeImage ? (
                    <div 
                      className="relative rounded-full overflow-hidden"
                      style={{
                        border: '10px solid rgba(0, 0, 0, 0.2)',
                        width: '80px',
                        height: '80px',
                      }}
                    >
                      <Image
                        src={store.storeImage}
                        alt={store.storeName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="relative rounded-full flex items-center justify-center"
                      style={{
                        border: '10px solid rgba(0, 0, 0, 0.2)',
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <span className="text-white font-bold text-xl">
                        {store.storeName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Store Name and Transaction Count - always at bottom */}
                <div className="flex flex-col items-center px-2 mt-auto">
                  <p className="text-white font-bold text-sm text-center leading-tight mb-1">
                    {store.storeName}
                  </p>
                  <p className="text-white/90 text-xs text-center">
                    {store.transactionCount}x transaksi
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
