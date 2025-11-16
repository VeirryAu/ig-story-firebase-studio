"use client";

import { useEffect, useRef } from 'react';

interface VideoSource {
  src: string;
  type: string;
}

/**
 * Hook to preload videos asynchronously starting from slide 1
 * Videos are cached progressively without blocking the UI
 */
export function useVideoPreload(videoSources: VideoSource[], startPreload: boolean = false) {
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const preloadedRef = useRef(false);

  useEffect(() => {
    if (!startPreload || preloadedRef.current || videoSources.length === 0) {
      return;
    }

    // Group sources by video (for screen-13, we have 3 sources for the same video)
    // We'll create one video element per unique video, but prefetch all formats
    const videoGroups = new Map<string, VideoSource[]>();
    videoSources.forEach((source) => {
      // Extract base video name (remove format extension)
      const baseName = source.src.replace(/-(av1|webm|h264)\.(mp4|webm)$/, '');
      if (!videoGroups.has(baseName)) {
        videoGroups.set(baseName, []);
      }
      videoGroups.get(baseName)!.push(source);
    });

    // Create hidden video elements for preloading (one per video)
    const videos: HTMLVideoElement[] = [];

    videoGroups.forEach((sources) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true; // Muted during preload to avoid autoplay restrictions (playback video has sound enabled)
      video.playsInline = true;
      video.style.display = 'none';
      video.style.position = 'absolute';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.opacity = '0';
      video.style.pointerEvents = 'none';

      // Add all source elements (browser will choose best supported)
      sources.forEach((source) => {
        const sourceElement = document.createElement('source');
        sourceElement.src = source.src;
        sourceElement.type = source.type;
        video.appendChild(sourceElement);
      });

      // Add to DOM for preloading
      document.body.appendChild(video);
      videos.push(video);

      // Start preloading (this will cache the video)
      video.load();
    });

    // Also prefetch all video sources using link prefetch for better caching
    videoSources.forEach((source) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'video';
      link.href = source.src;
      document.head.appendChild(link);
    });

    preloadRef.current = videos[0] || null;
    preloadedRef.current = true;

    // Cleanup
    return () => {
      videos.forEach((video) => {
        if (video && video.parentNode) {
          video.parentNode.removeChild(video);
        }
      });
      // Remove prefetch links
      document.head.querySelectorAll('link[rel="prefetch"][as="video"]').forEach((link) => {
        if (videoSources.some((source) => link.getAttribute('href') === source.src)) {
          link.remove();
        }
      });
    };
  }, [videoSources, startPreload]);

  return preloadRef.current;
}

