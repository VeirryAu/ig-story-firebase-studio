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
  const hasStartedPlayingRef = useRef(false);

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

  // Initialize audio element with progressive loading
  useEffect(() => {
    if (!src) {
      console.warn('[BackgroundMusic] No src provided');
      return;
    }

    console.log('[BackgroundMusic] Initializing audio', { src, isMuted, isPlaying: isPlayingRef.current });
    const audio = new Audio(src);
    
    // Use 'metadata' preload for faster initial load - browser will load metadata first
    // then progressively load audio data as needed
    audio.preload = 'metadata'; // Changed from 'auto' to 'metadata' for faster initial load
    
    audio.loop = loop;
    audio.volume = 1.0;
    audio.muted = isMuted;
    
    // Enable crossOrigin for better caching and CDN support
    audio.crossOrigin = 'anonymous';

    const handleCanPlay = () => {
      console.log('[BackgroundMusic] canplay event fired', {
        paused: audio.paused,
        muted: audio.muted,
        readyState: audio.readyState,
        shouldPlay: isPlayingRef.current,
        currentTime: audio.currentTime
      });
      setIsReady(true);
      setHasError(false);
      // Audio is ready - try to play if we should be playing
      // Use a small timeout to ensure state is synced
      setTimeout(() => {
        if (isPlayingRef.current && audio.paused) {
          // Only reset to beginning if this is the first time (audio hasn't started yet)
          // Otherwise, continue from where it is
          if (audio.currentTime === 0 && !hasStartedPlayingRef.current) {
            audio.currentTime = 0; // Start from beginning only on first play
          }
          // Ensure muted state matches
          audio.muted = isMuted;
          // Try to play
          if (!audio.muted) {
            console.log('[BackgroundMusic] Auto-playing on canplay');
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('[BackgroundMusic] Auto-play succeeded');
                  hasStartedPlayingRef.current = true;
                })
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
          // Only reset to beginning if this is the first time
          if (audio.currentTime === 0 && !hasStartedPlayingRef.current) {
            audio.currentTime = 0; // Start from beginning only on first play
          }
          // Ensure muted state matches
          audio.muted = isMuted;
          if (!audio.muted) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  hasStartedPlayingRef.current = true;
                })
                .catch((error) => {
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

    // Progressive loading: Start loading metadata first, then buffer progressively
    // This allows playback to start before the entire file is downloaded
    const startProgressiveLoad = () => {
      // Load metadata first (fast)
    audio.load();
      
      // Once metadata is loaded, start buffering progressively
      const handleLoadedMetadata = () => {
        console.log('[BackgroundMusic] Metadata loaded, starting progressive buffering');
        // Set preload to auto after metadata is loaded to start buffering
        audio.preload = 'auto';
        // Trigger additional buffering by seeking slightly (forces buffer)
        if (audio.duration > 0) {
          const seekTime = Math.min(1, audio.duration * 0.1); // Seek to 10% or 1 second
          audio.currentTime = seekTime;
          // Reset to beginning after buffering starts
          setTimeout(() => {
            audio.currentTime = 0;
          }, 100);
        }
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    };
    
    startProgressiveLoad();

    audioRef.current = audio;
    
    // Expose audio element to window for debugging (development only)
    if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true')) {
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

  // Handle play/pause - don't reset audio, just play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // If audio is ready, handle play/pause immediately
    if (isReady) {
    if (isPlaying) {
        // Don't reset currentTime - let it continue playing from where it is
        // Only play if it's paused
        if (audio.paused) {
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

  // Track if audio has ever started playing (for initial reset only)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    // Only reset to start the very first time we start playing
    // After that, let it continue playing continuously across stories
    if (isPlaying && !hasStartedPlayingRef.current && audio.paused) {
      // This is the first time starting - reset to beginning
      audio.currentTime = 0;
      hasStartedPlayingRef.current = true;
    } else if (isPlaying) {
      // Audio is already playing or has played before - don't reset
      hasStartedPlayingRef.current = true;
    }
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
      currentTime: audio.currentTime,
      hasUserInteracted: hasUserInteractedRef.current,
      audioUnlocked: audioUnlockedRef.current,
      hasStartedPlaying: hasStartedPlayingRef.current
    });
    
    // Mark that we've had user interaction (if called from user event)
    hasUserInteractedRef.current = true;
    audioUnlockedRef.current = true;
    
    // Ensure audio is not muted when trying to play
    if (audio.muted && !isMuted) {
      console.log('[BackgroundMusic] Unmuting audio');
      audio.muted = false;
    }
    
    // Always set muted state to match prop
    audio.muted = isMuted;
    
    if (audio.paused) {
      // Only reset to beginning if this is the very first time playing
      // Otherwise, continue from where it is (for continuous playback across stories)
      if (!hasStartedPlayingRef.current) {
        audio.currentTime = 0;
        console.log('[BackgroundMusic] First time playing - starting from beginning');
      } else {
        console.log('[BackgroundMusic] Resuming playback - continuing from current position');
      }
      
      console.log('[BackgroundMusic] Attempting to play audio');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[BackgroundMusic] Audio playing successfully', {
              paused: audio.paused,
              muted: audio.muted,
              volume: audio.volume,
              currentTime: audio.currentTime
            });
            audioUnlockedRef.current = true;
            hasStartedPlayingRef.current = true;
          })
          .catch((error) => {
            console.error('[BackgroundMusic] Failed to play audio:', error.name, error.message);
            if (error.name === 'NotAllowedError') {
              console.warn('[BackgroundMusic] Autoplay blocked - waiting for user interaction');
              // Don't mark as unlocked if autoplay is blocked
              audioUnlockedRef.current = false;
            } else {
              console.warn('Failed to play background music:', error);
            }
          });
      }
    } else {
      console.log('[BackgroundMusic] Audio is already playing - continuing');
    }
  }, [isMuted]);

  return {
    audioRef: audioRef.current,
    isReady,
    hasError,
    playAudio,
  };
}

