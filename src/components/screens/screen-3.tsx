"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { ServerResponse } from "@/types/server";
import { useTranslations } from "@/hooks/use-translations";

interface Screen3Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen3({ serverResponse, isActive = false }: Screen3Props) {
  const { t } = useTranslations();
  const trxCount = serverResponse?.trxCount || 0;
  const favoriteProducts = serverResponse?.listProductFavorite || [];

  const [showHeader, setShowHeader] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (!isActive) {
      setShowHeader(false);
      setVisibleItems([]);
      timers.forEach(clearTimeout);
      return () => {};
    }

    setShowHeader(true);

    favoriteProducts.forEach((_, index) => {
      const orderFromLowest = favoriteProducts.length - 1 - index;
      const delay = 250 + orderFromLowest * 140;
      const timer = setTimeout(() => {
        setVisibleItems(prev => (prev.includes(index) ? prev : [...prev, index]));
      }, delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, favoriteProducts]);

  return (
    <div 
      className="relative w-full h-full flex flex-col"
      style={{ backgroundColor: '#C83E2B' }}
    >
      {/* Header Text */}
      <div className="px-6 pt-8 pb-4 mt-20 mb-10">
        <p
          className={`text-white font-bold text-center text-lg leading-relaxed transition-all duration-500 ${
            showHeader ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          {t('screen3.header', { trxCount })}
        </p>
      </div>

      {/* List of Product Cards */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-3">
        {favoriteProducts.map((product, index) => {
          const rank = index + 1;
          const isFirstRank = rank === 1;
          const cardBgColor = isFirstRank ? '#F45F49' : '#A54133';
          const isVisible = visibleItems.includes(index);
          const transitionDelay = `${isVisible ? index * 160 : 0}ms`;

          return (
            <div
              key={index}
              className={`w-full rounded-lg p-4 flex items-center gap-4 transform transition duration-700 ${
                isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-8 scale-95"
              }`}
              style={{ backgroundColor: cardBgColor, transitionDelay }}
            >
              {/* Image circle on left */}
              <div className="flex-shrink-0">
                {product.productImage ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={product.productImage}
                      alt={product.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <span className="text-white font-bold text-xl">
                      {product.productName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Name and Number of Cups */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base truncate">
                  {product.productName}
                </p>
                <p className="text-white/90 text-sm">
                  {product.countCups} {t('screen3.cup')}
                </p>
              </div>

              {/* Ranking */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {isFirstRank && (
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                )}
                <span className="text-white font-bold text-xl">
                  #{rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
