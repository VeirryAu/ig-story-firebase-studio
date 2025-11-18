"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { shareImageUrl } from '@/lib/native-bridge';
import { useTranslations } from '@/hooks/use-translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Array<{ id: string; label: string }>;
  onCaptureSlide: (slideId: string) => Promise<string>;
}

export function ShareModal({ isOpen, onClose, slides, onCaptureSlide }: ShareModalProps) {
  const { t } = useTranslations();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturingSlideId, setCapturingSlideId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShareSlide = async (slideId: string) => {
    try {
      setIsCapturing(true);
      setCapturingSlideId(slideId);
      
      // Get the share URL for the slide
      const shareUrlString = await onCaptureSlide(slideId);
      
      // Share the URL using shareImageUrl
      shareImageUrl(shareUrlString);
      
      // Close modal after sharing
      onClose();
    } catch (error) {
      console.error('Error generating share URL:', error);
      alert('Failed to generate share URL. Please try again.');
    } finally {
      setIsCapturing(false);
      setCapturingSlideId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('shareModal.title')}</h2>
          <p className="text-gray-600 mt-1">{t('shareModal.subtitle')}</p>
        </div>

        {/* Slide list */}
        <div className="space-y-2">
          {slides.map((slide) => {
            const isGenerating = capturingSlideId === slide.id;
            const isDisabled = isCapturing && !isGenerating;

            return (
              <button
                key={slide.id}
                onClick={() => handleShareSlide(slide.id)}
                disabled={isDisabled}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  isGenerating
                    ? 'border-blue-500 bg-blue-50'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{slide.label}</span>
                  {isGenerating && (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

