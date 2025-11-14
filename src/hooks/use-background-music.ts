"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseBackgroundMusicProps {
  src: string;
  isPlaying: boolean;
  isMuted: boolean;
  loop?: boolean;
}

/**
 * Hook to manage background music that plays across all slides
 * Music is cached asynchronously and can be paused/muted
 */
export function useBackgroundMusic({ 
  src, 
  isPlaying, 
  isMuted, 
  loop = true 
}: UseBackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasUserInteractedRef = useRef(false);
  const audioUnlockedRef = useRef(false);

  // Keep ref in sync with prop
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Global user interaction handler to unlock audio (only once)
  useEffect(() => {
    if (audioUnlockedRef.current) return;

    const unlockAudio = () => {
      if (!audioUnlockedRef.current && audioRef.current) {
        console.log('[BackgroundMusic] Unlocking audio via user interaction');
        audioUnlockedRef.current = true;
        hasUserInteractedRef.current = true;
        
        // Try to play immediately on user interaction
        const audio = audioRef.current;
        if (audio && audio.paused && !audio.muted && isPlayingRef.current) {
          audio.currentTime = 0;
          audio.play().catch((error) => {
            console.error('[BackgroundMusic] Failed to unlock audio:', error);
          });
        }
      }
    };

    // Listen for any user interaction
    const events = ['click', 'touchstart', 'touchend', 'mousedown', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!src) {
      console.warn('[BackgroundMusic] No src provided');
      return;
    }

    console.log('[BackgroundMusic] Initializing audio', { src, isMuted, isPlaying: isPlayingRef.current });
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.loop = loop;
    audio.volume = 1.0;
    audio.muted = isMuted;

    const handleCanPlay = () => {
      console.log('[BackgroundMusic] canplay event fired', {
        paused: audio.paused,
        muted: audio.muted,
        readyState: audio.readyState,
        shouldPlay: isPlayingRef.current
      });
      setIsReady(true);
      setHasError(false);
      // Audio is ready - try to play if we should be playing
      // Use a small timeout to ensure state is synced
      setTimeout(() => {
        if (isPlayingRef.current && audio.paused) {
          audio.currentTime = 0; // Start from beginning
          // Ensure muted state matches
          audio.muted = isMuted;
          // Try to play
          if (!audio.muted) {
            console.log('[BackgroundMusic] Auto-playing on canplay');
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => console.log('[BackgroundMusic] Auto-play succeeded'))
                .catch((error) => {
                  if (error.name === 'NotAllowedError') {
                    console.warn('[BackgroundMusic] Autoplay blocked for background music');
                  } else {
                    console.error('[BackgroundMusic] Auto-play error:', error);
                  }
                });
            }
          } else {
            console.log('[BackgroundMusic] Audio is muted, not playing');
          }
        }
      }, 50);
    };

    const handleError = (e: Event) => {
      setHasError(true);
      console.error('[BackgroundMusic] Loading error:', e);
      const audioEl = e.target as HTMLAudioElement;
      if (audioEl) {
        console.error('[BackgroundMusic] Error details:', {
          error: audioEl.error,
          networkState: audioEl.networkState,
          readyState: audioEl.readyState,
          src: audioEl.src
        });
      }
    };

    const handleLoadedData = () => {
      setIsReady(true);
      // Audio has loaded data - try to play if we should be playing
      // Use a small timeout to ensure state is synced
      setTimeout(() => {
        if (isPlayingRef.current && audio.paused) {
          audio.currentTime = 0; // Start from beginning
          // Ensure not muted
          if (!audio.muted) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                if (error.name === 'NotAllowedError') {
                  console.warn('Autoplay blocked for background music');
                }
              });
            }
          }
        }
      }, 50);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);

    // Load the audio
    audio.load();

    audioRef.current = audio;
    
    // Expose audio element to window for debugging (development only)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).__backgroundMusicAudio = audio;
      console.log('[BackgroundMusic] Audio element exposed to window.__backgroundMusicAudio for debugging');
    }

    // Cleanup
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, [src, loop]); // Only recreate when src or loop changes

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // If audio is ready, handle play/pause immediately
    if (isReady) {
      if (isPlaying) {
        // Reset to beginning if starting fresh (currentTime is 0 or near end)
        if (audio.currentTime === 0 || (audio.duration > 0 && audio.currentTime >= audio.duration - 0.1)) {
          audio.currentTime = 0;
        }
        // Try to play - use a small delay to ensure state is synced
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (error.name === 'NotAllowedError') {
              console.warn('Autoplay blocked for background music');
            } else {
              console.warn('Failed to play background music:', error);
            }
          });
        }
      } else {
        audio.pause();
      }
    } else if (isPlaying) {
      // If not ready yet but should be playing, wait for ready state
      // The canplay/loadeddata handlers will start playback
    }
  }, [isPlaying, isReady]);

  // Handle muted state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  // Reset audio to start when story first opens (when isPlaying becomes true from false)
  const wasPlayingRef = useRef(false);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    // If we're starting to play for the first time (wasn't playing before), reset to start
    if (isPlaying && !wasPlayingRef.current) {
      audio.currentTime = 0;
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying, isReady]);

  // Expose a method to force play (useful for user interaction)
  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn('[BackgroundMusic] Audio element not found');
      return;
    }
    
    console.log('[BackgroundMusic] playAudio called', {
      paused: audio.paused,
      muted: audio.muted,
      isMuted,
      readyState: audio.readyState,
      src: audio.src,
      currentTime: audio.currentTime
    });
    
    // Ensure audio is not muted when trying to play
    if (audio.muted && !isMuted) {
      console.log('[BackgroundMusic] Unmuting audio');
      audio.muted = false;
    }
    
    // Always set muted state to match prop
    audio.muted = isMuted;
    
    if (audio.paused) {
      audio.currentTime = 0;
      console.log('[BackgroundMusic] Attempting to play audio');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[BackgroundMusic] Audio playing successfully', {
              paused: audio.paused,
              muted: audio.muted,
              volume: audio.volume
            });
          })
          .catch((error) => {
            console.error('[BackgroundMusic] Failed to play audio:', error.name, error.message);
            if (error.name !== 'NotAllowedError') {
              console.warn('Failed to play background music:', error);
            }
          });
      }
    } else {
      console.log('[BackgroundMusic] Audio is already playing');
    }
  }, [isMuted]);

  return {
    audioRef: audioRef.current,
    isReady,
    hasError,
    playAudio,
  };
}

