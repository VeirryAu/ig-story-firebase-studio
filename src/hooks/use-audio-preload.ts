"use client";

import { useEffect, useRef } from 'react';

/**
 * Hook to preload audio files asynchronously
 * Audio is cached in the background without blocking the UI
 */
export function useAudioPreload(src: string, startPreload: boolean = false) {
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const preloadedRef = useRef(false);

  useEffect(() => {
    if (!startPreload || preloadedRef.current || !src) {
      return;
    }

    // Create a hidden audio element for preloading
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.muted = true; // Muted during preload
    audio.volume = 0; // Silent during preload

    // Start preloading
    audio.load();

    // Also prefetch using link element for better caching
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'audio';
    link.href = src;
    document.head.appendChild(link);

    preloadRef.current = audio;
    preloadedRef.current = true;

    // Cleanup
    return () => {
      if (preloadRef.current) {
        preloadRef.current.pause();
        preloadRef.current = null;
      }
      // Remove prefetch link
      const existingLink = document.head.querySelector(`link[href="${src}"]`);
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, [src, startPreload]);

  return preloadRef.current;
}

