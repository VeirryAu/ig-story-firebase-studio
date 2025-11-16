"use client";

import { useEffect, useRef, useState } from "react";

interface Screen14Props {
  onVideoReady?: () => void;
}

export function Screen14({ onVideoReady }: Screen14Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Video sources in order of preference (browser will choose best supported)
    const videoSources = [
      {
        src: '/stories-asset/slides13/forecap-video-barista-av1.mp4',
        type: 'video/mp4; codecs="av01.0.05M.08"',
      },
      {
        src: '/stories-asset/slides13/forecap-video-barista.webm',
        type: 'video/webm; codecs="vp9"',
      },
      {
        src: '/stories-asset/slides13/forecap-video-barista-h264.mp4',
        type: 'video/mp4; codecs="avc1.42E01E"',
      },
    ];

    // Set video attributes for optimal Instagram-like playback
    video.preload = 'auto';
    video.playsInline = true;
    video.loop = false;

    // Clear existing sources
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    // Add all source elements
    videoSources.forEach((source) => {
      const sourceElement = document.createElement('source');
      sourceElement.src = source.src;
      sourceElement.type = source.type;
      video.appendChild(sourceElement);
    });

    // Handle video events
    const handleCanPlay = () => {
      // Video can start playing (has enough data buffered)
      setIsPlaying(true);
      setHasError(false);
      onVideoReady?.();
      
      // Try to play immediately
      video.play().catch((err) => {
        console.warn('Auto-play prevented:', err);
        // User interaction will be required, but video is ready
      });
    };

    const handleLoadedData = () => {
      // Some data is loaded, can start playing
      if (!isPlaying) {
        video.play().catch(() => {
          // Auto-play might be blocked, but video is ready
        });
      }
    };

    const handleError = () => {
      setHasError(true);
      console.error('Video loading error');
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Load the video
    video.load();

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.pause();
      video.currentTime = 0;
    };
  }, [onVideoReady, isPlaying]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        preload="auto"
      />

      {/* Loading indicator */}
      {!isPlaying && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center text-white p-8">
            <p className="text-xl mb-4">Unable to load video</p>
            <p className="text-sm text-white/70">Please check your connection</p>
          </div>
        </div>
      )}
    </div>
  );
}

