"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

interface ShareButtonProps {
  onClick?: () => void;
}

export function ShareButton({ onClick }: ShareButtonProps) {
  const { t } = useTranslations();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`absolute bottom-5 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto share-button-container transition-all duration-500 ${
        isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
      }`}
      data-share-exclude="true"
    >
      <button
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-black hover:bg-black/90 transition-colors pointer-events-auto"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <Upload className="w-5 h-5 text-white" />
        <span className="text-white font-bold text-sm">{t('common.share')}</span>
      </button>
    </div>
  );
}

