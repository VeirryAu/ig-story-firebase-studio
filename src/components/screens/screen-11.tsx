"use client";

import Image from "next/image";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen11Props {
  serverResponse?: ServerResponse;
}

export function Screen11({ serverResponse }: Screen11Props) {
  const { t } = useTranslations();
  const trxCount = serverResponse?.trxCount || 70;
  const totalPoint = serverResponse?.totalPoint || 450;
  const favoriteProduct = serverResponse?.listProductFavorite?.[0]?.productName || 'Aren Latte';
  const favoriteStore = serverResponse?.listFavoriteStore?.[0]?.storeName || 'Cikini';
  const totalSaving = serverResponse?.cheaperSubsDesc || 'Rp325rb';

  // Format the saving amount to remove "Rp" prefix if present and format it
  const formatSaving = (saving: string) => {
    return saving.replace(/^Rp\s*/i, '');
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#1A4034' }}
    >
      {/* Background Image - Always at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full"
        style={{ 
          height: '50%',
          zIndex: 1,
          opacity: 0.1,
        }}
      >
        <Image
          src="/stories-asset/slides11/slide11-bgasset.png"
          alt="Coffee journey background"
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-8 pb-4 mt-16">
        {/* Title */}
        <h1 className="text-white font-bold text-center text-md mb-8">
          {t('screen11.title')}
        </h1>

        {/* Data Cards Grid */}
        <div className="w-full max-w-md mx-auto space-y-4 mb-6">
          {/* Row 1: Total Cup and Total Poin */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Cup Dibeli */}
            <div 
              className="rounded-2xl p-4 flex flex-col"
              style={{ backgroundColor: '#006041' }}
            >
              <p className="text-white font-bold text-xs text-center mb-2">
                {t('screen11.totalCupDibeli')}
              </p>
              <p 
                className="text-xl font-bold text-center"
                style={{ color: '#FFD700' }}
              >
                {trxCount}
              </p>
            </div>

            {/* Total Poin Didapat */}
            <div 
              className="rounded-2xl p-4 flex flex-col"
              style={{ backgroundColor: '#006041' }}
            >
              <p className="text-white font-bold text-xs text-center mb-2">
                {t('screen11.totalPoinDidapat')}
              </p>
              <p 
                className="text-xl font-bold text-center"
                style={{ color: '#FFD700' }}
              >
                {totalPoint}
              </p>
            </div>
          </div>

          {/* Row 2: Menu Terfavorit (Full Width) */}
          <div 
            className="rounded-2xl p-4 flex flex-col"
            style={{ backgroundColor: '#006041' }}
          >
            <p className="text-white font-bold text-xs text-center mb-2">
              {t('screen11.menuTerfavorit')}
            </p>
            <p 
              className="text-xl font-bold text-center"
              style={{ color: '#FFD700' }}
            >
              {favoriteProduct}
            </p>
          </div>

          {/* Row 3: Store Terfavorit and Total Saving */}
          <div className="grid grid-cols-2 gap-4">
            {/* Store Terfavorit */}
            <div 
              className="rounded-2xl p-4 flex flex-col"
              style={{ backgroundColor: '#006041' }}
            >
              <p className="text-white font-bold text-xs text-center mb-2">
                {t('screen11.storeTerfavorit')}
              </p>
              <p 
                className="text-md font-bold text-center"
                style={{ color: '#FFD700' }}
              >
                {favoriteStore}
              </p>
            </div>

            {/* Total Saving */}
            <div 
              className="rounded-2xl p-4 flex flex-col"
              style={{ backgroundColor: '#006041' }}
            >
              <p className="text-white font-bold text-xs text-center mb-2">
                {t('screen11.totalSaving')}
              </p>
              <p 
                className="text-md font-bold text-center"
                style={{ color: '#FFD700' }}
              >
                {formatSaving(totalSaving)}
              </p>
            </div>
          </div>
        </div>

        {/* Concluding Message */}
        <div className="w-full max-w-md mx-auto mt-4 mb-6">
          <p className="text-white font-bold text-center text-base">
            {t('screen11.conclusion')}
          </p>
        </div>
      </div>
    </div>
  );
}
