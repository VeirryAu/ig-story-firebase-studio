"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Story } from '@/types/story';
import type { ServerResponse } from '@/types/server';
import Image from 'next/image';
import { StoryProgressBar } from './story-progress-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useVideoPreload } from '@/hooks/use-video-preload';
import { useBackgroundMusic } from '@/hooks/use-background-music';
import { useAudioPreload } from '@/hooks/use-audio-preload';
import { Screen2NoTrx } from '@/components/screens/screen-2-notrx';
import { ShareButton } from '@/components/share-button';
import { ShareModal } from '@/components/share-modal';
import config from '@/lib/const.json';
import { closeWebView, shareImageUrl, track } from '@/lib/native-bridge';
import { isDevMode } from '@/lib/env';
import { useTranslations } from '@/hooks/use-translations';
import { captureScreenshot } from '@/lib/screenshot';

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex?: number;
  onClose: () => void;
  serverResponse?: ServerResponse;
  fullscreenSlide?: string; // e.g., "screen-01" or "screen-1"
  fullscreenDuration?: number; // Duration in seconds for fullscreen mode
}

interface VideoSlideProps {
  src: string;
  alt: string;
  isActive: boolean;
  isPaused: boolean;
  slideId: string;
  videoRefs: React.MutableRefObject<Map<string, HTMLVideoElement>>;
  isMuted: boolean;
}

function VideoSlide({ src, alt, isActive, isPaused, slideId, videoRefs, isMuted }: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  
  // For screen-13, we need to handle multiple sources
  const isScreen14 = slideId === 'screen-13';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Register video ref
    videoRefs.current.set(slideId, video);

    // Set video attributes for optimal Instagram-like playback
    video.preload = 'auto';
    video.playsInline = true;
    video.loop = false;
    video.volume = 1.0; // Full volume
    video.muted = isMuted; // Set initial muted state

    const handleCanPlay = () => {
      setCanPlay(true);
      setHasError(false);
      // Auto-play when active and not paused (Instagram-like: play as soon as possible)
      if (isActive && !isPaused) {
        // Force play with multiple attempts
        const attemptPlay = () => {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Autoplay started successfully
                setNeedsUserInteraction(false);
              })
              .catch((error) => {
          // Autoplay with sound might be blocked - show play button
                if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
            setNeedsUserInteraction(true);
          }
        });
          }
        };
        attemptPlay();
        // Also try after a small delay in case the first attempt fails
        setTimeout(attemptPlay, 100);
      }
    };

    const handleCanPlayThrough = () => {
      // Video can play through without buffering - ensure it's playing
      if (isActive && !isPaused && !video.paused) {
        // Video is already playing, good
      } else if (isActive && !isPaused) {
        video.play().catch((error) => {
          // Autoplay with sound might be blocked
          if (error.name === 'NotAllowedError') {
            setNeedsUserInteraction(true);
          }
        });
      }
    };

    const handleLoadedData = () => {
      // Some data is loaded, can start playing (Instagram-like: start playing immediately)
      if (isActive && !isPaused) {
        video.play().catch((error) => {
          // Autoplay with sound might be blocked
          if (error.name === 'NotAllowedError') {
            setNeedsUserInteraction(true);
          }
        });
      }
    };

    const handleError = () => {
      setHasError(true);
      console.error('Video loading error');
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Load the video
    video.load();

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      videoRefs.current.delete(slideId);
    };
  }, [slideId, videoRefs, isActive, isPaused]);

  // Handle play/pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canPlay) return;

    if (isActive && !isPaused) {
      video.play().catch((error) => {
        // Autoplay with sound might be blocked
        if (error.name === 'NotAllowedError') {
          setNeedsUserInteraction(true);
        }
      });
    } else {
      video.pause();
    }
  }, [isActive, isPaused, canPlay]);

  // Handle user interaction to start video with sound
  const handleUserInteraction = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setNeedsUserInteraction(false);
    video.play().catch((error) => {
      console.error('Failed to play video:', error);
    });
  };

  // Update muted state when prop changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  // Get video duration for slide 14
  useEffect(() => {
    const video = videoRef.current;
    if (!video || slideId !== 'screen-13') return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        // Dispatch custom event with video duration in milliseconds
        window.dispatchEvent(new CustomEvent('videoDuration', { 
          detail: { duration: video.duration * 1000 }
        }));
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // If duration is already available
    if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
      window.dispatchEvent(new CustomEvent('videoDuration', { 
        detail: { duration: video.duration * 1000 }
      }));
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [slideId]);

  // Reset video when slide becomes active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      if (!isPaused && canPlay) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video started playing
              setNeedsUserInteraction(false);
            })
            .catch((error) => {
          // Auto-play might be blocked
              if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                setNeedsUserInteraction(true);
              }
        });
        }
      }
    }
  }, [isActive, isPaused, canPlay]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
        preload="auto"
        aria-label={alt}
      >
        {isScreen14 ? (
          <>
            <source src="/stories-asset/slides13/forecap-video-barista-av1.mp4" type='video/mp4; codecs="av01.0.05M.08"' />
            <source src="/stories-asset/slides13/forecap-video-barista.webm" type='video/webm; codecs="vp9"' />
            <source src="/stories-asset/slides13/forecap-video-barista-h264.mp4" type='video/mp4; codecs="avc1.42E01E"' />
          </>
        ) : (
          <source src={src} type="video/mp4" />
        )}
      </video>
      {!canPlay && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      {needsUserInteraction && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
          onClick={handleUserInteraction}
          onTouchStart={handleUserInteraction}
        >
          <div className="bg-white/20 backdrop-blur-md rounded-full p-6 hover:bg-white/30 transition-colors">
            <svg 
              className="w-16 h-16 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="absolute bottom-8 text-white text-sm">Tap to play with sound</p>
        </div>
      )}
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

export function StoryViewer({ stories, initialStoryIndex = 0, onClose, serverResponse, fullscreenSlide, fullscreenDuration }: StoryViewerProps) {
  const { t } = useTranslations();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const isNavigatingRef = useRef(false); // Prevent rapid-fire navigation
  const storyViewerRef = useRef<HTMLDivElement>(null);
  
  // Check if we're in fullscreen mode (no navigation buttons)
  const isFullscreenMode = !!fullscreenSlide;

  // Development-only: Limit slides to specific index for development convenience
  const devMaxSlide = isDevMode() ? config.devMaxSlide : null;
  
  // Filter slides based on trxCount: if trxCount is 0, only show slide1 and slide2
  const originalStory = stories[currentStoryIndex];
  let filteredSlides = originalStory?.slides || [];
  
  // If trxCount is 0, only show first 2 slides (screen-1 and screen-2)
  if (serverResponse?.trxCount === 0) {
    filteredSlides = originalStory?.slides.slice(0, 2) || [];
  }
  
  // Apply development mode limit if set
  const limitedSlides = (devMaxSlide !== null && devMaxSlide !== undefined)
    ? filteredSlides.slice(0, devMaxSlide + 1) 
    : filteredSlides;
  
  const currentStory = originalStory ? { ...originalStory, slides: limitedSlides || [] } : originalStory;
  
  // In fullscreen mode, find and set the slide index
  useEffect(() => {
    if (fullscreenSlide && currentStory) {
      const slideIndex = currentStory.slides.findIndex(slide => slide.id === fullscreenSlide);
      if (slideIndex >= 0) {
        setCurrentSlideIndex(slideIndex);
        // For video slides, don't pause and unmute - let them autoplay with sound
        // For other slides, pause in fullscreen mode
        const targetSlide = currentStory.slides[slideIndex];
        if (targetSlide?.type !== 'video') {
          setIsPaused(true); // Pause non-video slides in fullscreen mode
        } else {
          setIsPaused(false); // Don't pause video slides - let them autoplay
          setIsMuted(false); // Unmute video in fullscreen mode so it autoplays with sound
        }
      }
    }
  }, [fullscreenSlide, currentStory]);
  
  // Auto-close after duration in fullscreen mode
  useEffect(() => {
    if (isFullscreenMode && fullscreenDuration && fullscreenDuration > 0) {
      const timer = setTimeout(() => {
        // After duration, the native app can take screenshot/video
        // We just keep the slide visible
      }, fullscreenDuration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isFullscreenMode, fullscreenDuration]);
  
  const currentSlide = currentStory?.slides[currentSlideIndex];
  const totalSlides = currentStory?.slides.length || 0;
  const isLastSlide = currentSlideIndex === totalSlides - 1;
  
  // Track banner event when first slide loads
  const hasTrackedBannerRef = useRef(false);
  useEffect(() => {
    if (currentSlideIndex === 0 && !hasTrackedBannerRef.current && serverResponse) {
      const eventValue = (serverResponse.trxCount || 0) > 0 ? 'happy' : 'sad';
      track('banner', eventValue);
      hasTrackedBannerRef.current = true;
    }
  }, [currentSlideIndex, serverResponse]);
  
  // Track final summary slide when user reaches last slide
  const hasTrackedFinalSummaryRef = useRef(false);
  useEffect(() => {
    if (isLastSlide && !hasTrackedFinalSummaryRef.current && serverResponse) {
      const trxCount = serverResponse.trxCount || 0;
      if (trxCount > 0) {
        track('finalSummarySlideHappy', 'viewed');
      } else {
        track('finalSummarySlideSad', 'viewed');
      }
      hasTrackedFinalSummaryRef.current = true;
    }
  }, [isLastSlide, serverResponse]);
  
  // Development-only: Auto-pause on specific slide for development convenience
  const devPauseOnSlide = isDevMode() ? config.devPauseOnSlide : null;
  const shouldAutoPause = devPauseOnSlide !== null && devPauseOnSlide !== undefined && currentSlideIndex === devPauseOnSlide;
  
  // Development mode warning
  useEffect(() => {
    if (devMaxSlide !== null && devMaxSlide !== undefined && isDevMode()) {
      console.log(`[StoryViewer] Development mode: Limited to slide ${devMaxSlide} (0-based index)`);
    }
  }, [devMaxSlide]);
  
  // Check if current slide is video (slide 14) - no background music for videos
  const isVideoSlide = currentSlide?.type === 'video';
  
  // Track if we've auto-unmuted on the last slide
  const hasAutoUnmutedOnLastSlideRef = useRef(false);
  
  // Preload background music starting from slide 1
  useAudioPreload(config.backgroundMusic, currentSlideIndex >= 0);
  
  // Background music - play on all slides except video slides
  const shouldPlayMusic = !isPaused && !isVideoSlide && currentSlideIndex >= 0;
  const { isReady: audioReady, playAudio } = useBackgroundMusic({
    src: config.backgroundMusic,
    isPlaying: shouldPlayMusic,
    isMuted: isMuted,
    loop: true,
  });

  // Track if we've attempted to start audio on mount
  const hasAttemptedPlayRef = useRef(false);

  // Debug logging
  useEffect(() => {
    console.log('[StoryViewer] Audio state:', {
      audioReady,
      isPaused,
      isVideoSlide,
      currentSlideIndex,
      isMuted,
      shouldPlayMusic
    });
  }, [audioReady, isPaused, isVideoSlide, currentSlideIndex, isMuted, shouldPlayMusic]);

  // Ensure audio starts playing immediately when story viewer opens
  // Note: This will only work if there was a user interaction before mount
  useEffect(() => {
    if (!hasAttemptedPlayRef.current && !isVideoSlide && !isMuted) {
      hasAttemptedPlayRef.current = true;
      console.log('[StoryViewer] Attempting to start audio on mount');
      // Try to play immediately on mount
      // This might be blocked by autoplay policy, but user interaction handlers will catch it
      playAudio();
      
      // Also try after a short delay in case audio isn't ready yet
      const timer1 = setTimeout(() => {
        console.log('[StoryViewer] Retry 1: Attempting to play audio');
        playAudio();
      }, 100);
      
      // And again after audio is ready
      const timer2 = setTimeout(() => {
        if (audioReady) {
          console.log('[StoryViewer] Retry 2: Audio ready, attempting to play');
          playAudio();
        } else {
          console.log('[StoryViewer] Retry 2: Audio not ready yet');
        }
      }, 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [audioReady, isVideoSlide, isMuted, playAudio]);

  // Add a one-time click handler on the entire story viewer to unlock audio
  // Use storyViewerRef for both container and screenshot purposes
  const containerRef = storyViewerRef;
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFirstInteraction = (e: Event) => {
      console.log('[StoryViewer] First interaction on container:', e.type);
      if (!isVideoSlide && !isMuted) {
        playAudio();
      }
      // Remove listeners after first interaction
      container.removeEventListener('click', handleFirstInteraction);
      container.removeEventListener('touchstart', handleFirstInteraction);
    };

    container.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
    container.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });

    return () => {
      container.removeEventListener('click', handleFirstInteraction);
      container.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isVideoSlide, isMuted, playAudio]);

  // Development-only: Auto-pause when reaching the specified slide
  useEffect(() => {
    if (shouldAutoPause && !isPaused) {
      console.log(`[StoryViewer] Development mode: Auto-pausing on slide ${currentSlideIndex}`);
      setIsPaused(true);
    }
  }, [shouldAutoPause, currentSlideIndex, isPaused]);

  // Auto-unmute when reaching the last slide (video) for the first time
  useEffect(() => {
    if (isLastSlide && isVideoSlide && !hasAutoUnmutedOnLastSlideRef.current) {
      console.log('[StoryViewer] Last slide (video) detected - auto-unmuting audio');
      setIsMuted(false);
      hasAutoUnmutedOnLastSlideRef.current = true;
    }
    
    // Reset the flag when leaving the last slide
    if (!isLastSlide) {
      hasAutoUnmutedOnLastSlideRef.current = false;
    }
  }, [isLastSlide, isVideoSlide]);

  // Ensure audio plays when conditions change (but don't restart - let it continue)
  useEffect(() => {
    if (audioReady && !isPaused && !isVideoSlide && currentSlideIndex >= 0 && !isMuted) {
      // Only call playAudio if audio is paused - if it's already playing, let it continue
      // This ensures continuous playback across stories without restarting
      const audio = document.querySelector('audio');
      if (audio && audio.paused) {
        playAudio();
      }
    }
  }, [audioReady, isPaused, isVideoSlide, currentSlideIndex, isMuted, playAudio]);

  // Find video slides and preload them starting from slide 1
  const videoSlides = currentStory?.slides.filter(slide => slide.type === 'video') || [];
  const videoSources = videoSlides.map(slide => {
    // For screen-13, we have multiple sources - preload all formats
    if (slide.id === 'screen-13') {
      return [
        { src: '/stories-asset/slides13/forecap-video-barista-av1.mp4', type: 'video/mp4; codecs="av01.0.05M.08"' },
        { src: '/stories-asset/slides13/forecap-video-barista.webm', type: 'video/webm; codecs="vp9"' },
        { src: '/stories-asset/slides13/forecap-video-barista-h264.mp4', type: 'video/mp4; codecs="avc1.42E01E"' },
      ];
    }
    return slide.url ? [{ src: slide.url, type: 'video/mp4' }] : [];
  }).flat();

  // Start preloading videos asynchronously from slide 1 (not before)
  // This ensures videos are cached in the background while user views earlier slides
  useVideoPreload(videoSources, currentSlideIndex >= 0);

  // Listen for video duration from slide 14
  useEffect(() => {
    const handleVideoDuration = (event: CustomEvent<{ duration: number }>) => {
      // Only set duration if we're on slide 14
      if (currentSlide?.id === 'screen-13') {
        setVideoDuration(event.detail.duration);
      }
    };

    window.addEventListener('videoDuration', handleVideoDuration as EventListener);
    return () => {
      window.removeEventListener('videoDuration', handleVideoDuration as EventListener);
    };
  }, [currentSlide?.id]);

  // Reset video duration when leaving slide 14
  useEffect(() => {
    if (currentSlide?.id !== 'screen-13') {
      setVideoDuration(null);
    }
  }, [currentSlide?.id]);

  const resetAnimation = useCallback(() => {
    setAnimationKey(prev => prev + 1);
  }, []);

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentSlideIndex(0);
      resetAnimation();
    }
    // Do nothing when the last story finishes, to stay on the last slide.
  }, [currentStoryIndex, stories.length, resetAnimation]);

  const goToNextSlide = useCallback((e?: React.MouseEvent) => {
    // Don't allow navigation if on last slide
    const totalSlides = currentStory?.slides.length || 0;
    const isLastSlide = currentSlideIndex === totalSlides - 1;
    if (isLastSlide) {
      // Prevent event propagation to avoid triggering video pause/resume
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      isNavigatingRef.current = true;
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
      return;
    }
    if (isNavigatingRef.current) return; // Prevent rapid-fire navigation
    
    isNavigatingRef.current = true;
    
    if (currentStory && currentSlideIndex < currentStory.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      resetAnimation();
    } else {
      goToNextStory();
    }
    
    // Reset navigation lock after a short delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [currentStory, currentSlideIndex, goToNextStory, resetAnimation]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentSlideIndex(0);
      resetAnimation();
    }
  }, [currentStoryIndex, resetAnimation]);

  const goToPrevSlide = useCallback(() => {
    if (isNavigatingRef.current) return; // Prevent rapid-fire navigation
    isNavigatingRef.current = true;
    
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      resetAnimation();
    } else {
      goToPrevStory();
    }
    
    // Reset navigation lock after a short delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [currentSlideIndex, goToPrevStory, resetAnimation]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLastSlide) goToNextSlide();
      if (e.key === 'ArrowLeft') goToPrevSlide();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, onClose, isLastSlide]);

  const handlePointerDown = () => {
    // Don't pause on the last slide (video slide) to prevent video restart
    if (isLastSlide && isVideoSlide) {
      return;
    }
    setIsPaused(true);
    // Pause current video if playing
    const currentVideo = videoRefs.current.get(currentSlide?.id || '');
    if (currentVideo && !currentVideo.paused) {
      currentVideo.pause();
    }
    // User interaction - try to unlock and play audio
    if (!isVideoSlide && !isMuted) {
      playAudio();
    }
  };

  const handlePointerUp = () => {
    // Don't resume on the last slide (video slide) to prevent video restart
    if (isLastSlide && isVideoSlide) {
      return;
    }
    setIsPaused(false);
    // Resume current video if it's a video slide
    const currentVideo = videoRefs.current.get(currentSlide?.id || '');
    if (currentVideo && currentSlide?.type === 'video') {
      currentVideo.play().catch(() => {
        // Auto-play might be blocked
      });
    }
    // User interaction - try to unlock and play audio
    if (!isVideoSlide && !isMuted) {
      playAudio();
    }
  };

  // Handle initial user interaction to unlock audio
  const handleInitialInteraction = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    console.log('[StoryViewer] User interaction detected', {
      isVideoSlide,
      isMuted,
      audioReady,
      eventType: e?.type
    });
    // Always try to play on user interaction - this unlocks audio
    if (!isVideoSlide && !isMuted) {
      // Try to play even if audioReady is false - it might be loading
      playAudio();
    }
  }, [isVideoSlide, isMuted, audioReady, playAudio]);

  // Get screen name from slide ID
  const getScreenName = useCallback((slideId: string): string => {
    // For screen-6, determine screen name based on time period
    if (slideId === 'screen-6') {
      const now = new Date();
      const hours = now.getHours();
      
      if (hours < 12) {
        return 'Persona_Time_Daybreak_Catcher';
      } else if (hours >= 12 && hours < 17) {
        return 'Persona_Time_Sun_Chaser';
      } else {
        return 'Persona_Time_Twilight_Seeker';
      }
    }

    // Map other screen IDs to screen names
    const screenNameMap: Record<string, string> = {
      'screen-1': 'Intro',
      'screen-2': 'Total_Cups',
      'screen-3': 'Favorite_Products',
      'screen-4': 'Persona_Product',
      'screen-5': 'Fore_Points',
      'screen-7': 'Favorite_Store',
      'screen-8': 'Favorite_order_method',
      'screen-9': 'Other_Method',
      'screen-10': 'Subscriber_Screen',
      'screen-11': 'Summary',
      'screen-12': 'Feature_Teaser',
      'screen-13': 'Barista_Greeting',
    };

    return screenNameMap[slideId] || slideId;
  }, []);

  // Capture current slide and share as base64 image (no navigation/header chrome)
  const shareCurrentSlide = useCallback(async () => {
    if (!currentSlide || isFullscreenMode || isSharing) {
      return;
    }

    const screenName = getScreenName(currentSlide.id);
    track('in_place', screenName);

    const targetElement = storyViewerRef.current;
    if (!targetElement) {
      console.error('Story viewer container not found for screenshot capture');
      return;
    }

    setIsSharing(true);

    try {
      // For screen-13 (video slide), continue sharing the AV1 asset per requirements
      if (currentSlide.id === 'screen-13') {
        const videoUrl = `${window.location.origin}/stories-asset/slides13/forecap-video-barista-av1.mp4`;
        shareImageUrl(videoUrl);
        return;
      }

      const dataUrl = await captureScreenshot(targetElement);
      shareImageUrl(dataUrl);
    } catch (error) {
      console.error('Failed to capture screenshot for sharing', error);
      if (typeof window !== 'undefined') {
        alert('Failed to capture screenshot. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  }, [currentSlide, getScreenName, isFullscreenMode, isSharing]);

  const handleShareButtonClick = useCallback(() => {
    void shareCurrentSlide();
  }, [shareCurrentSlide]);

  // Handle share modal for last slide
  const handleShareModalOpen = () => {
    setShowShareModal(true);
  };

  // Generate share URL for specific slide (for share modal)
  const handleCaptureSlide = async (slideId: string): Promise<string> => {
    // Get screen name and track the share event
    const screenName = getScreenName(slideId);
    track('screen_picker', screenName);

    // For screen-13 (video slide), return the AV1 video URL directly
    if (slideId === 'screen-13') {
      return `${window.location.origin}/stories-asset/slides13/forecap-video-barista-av1.mp4`;
    }

    // For other slides, generate fullscreen URL
    const currentUrl = window.location.origin + window.location.pathname;
    const duration = 10; // 10 seconds default
    
    // Build URL with fullscreen parameter and duration
    const shareUrlString = `${currentUrl}?fullscreen=${slideId}&duration=${duration}`;
    
    // Return the URL (native app will handle opening it)
    return shareUrlString;
  };

  // Get slide list for share modal
  const getSlideList = () => {
    if (!currentStory) return [];
    return currentStory.slides.map((slide, index) => ({
      id: slide.id,
      label: `Screen ${index + 1}`,
    }));
  };

  // Handle close with native bridge
  const handleClose = () => {
    closeWebView();
    onClose();
  };

  if (!currentStory || !currentSlide) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center font-body backdrop-blur-sm">
      <div 
        ref={storyViewerRef}
        className="relative w-full h-[100dvh] sm:max-w-[430px] sm:aspect-[9/16] sm:h-auto bg-primary sm:rounded-lg overflow-hidden shadow-2xl select-none touch-pan-y story-viewer-container"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleInitialInteraction}
        onTouchStart={handleInitialInteraction}
        onMouseDown={handleInitialInteraction}
        onKeyDown={(e) => {
          // Only handle initial interaction for audio unlocking
          // Keyboard navigation is handled by window-level listener to avoid double-triggering
          handleInitialInteraction();
        }}
        tabIndex={0}
        role="dialog"
        aria-modal="true"
        aria-label={`Story by ${currentStory.user.name}`}
      >
        {/* Slides Container */}
        <div className="absolute inset-0">
          {currentStory.slides.map((slide, index) => {
            const isActive = index === currentSlideIndex;
            
            return (
              <div
                key={slide.id}
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 10 : 1,
                }}
              >
                {slide.type === 'image' && slide.url && (
                  <Image
                    src={slide.url}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority={isActive}
                    data-ai-hint={slide.aiHint}
                  />
                )}
                {slide.type === 'video' && (
                  <VideoSlide
                    src={slide.url || ''}
                    alt={slide.alt}
                    isActive={isActive}
                    isPaused={isPaused}
                    slideId={slide.id}
                    videoRefs={videoRefs}
                    isMuted={isMuted}
                  />
                )}
                {slide.type === 'component' && (
                  <div className="w-full h-full">
                    {slide.id === 'screen-1' && serverResponse?.userName
                      ? React.cloneElement(slide.component as React.ReactElement, { userName: serverResponse.userName })
                      : slide.id === 'screen-2' && serverResponse?.trxCount === 0
                      ? <Screen2NoTrx />
                      : slide.id === 'screen-2' && serverResponse?.trxCount !== undefined
                      ? React.cloneElement(slide.component as React.ReactElement, { trxCount: serverResponse.trxCount })
                      : slide.id === 'screen-3' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-4' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-5' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-7' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-8' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-9' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-10' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-11' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-12' && serverResponse
                      ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
                      : slide.id === 'screen-1' && currentStory?.user?.name
                      ? React.cloneElement(slide.component as React.ReactElement, { userName: currentStory.user.name || 'John' })
                      : slide.component
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overlay with UI elements - hidden in fullscreen mode */}
        {!isFullscreenMode && (
          <>
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-black/50"></div>
            {/* Top shadow gradient - 30px height */}
            <div className="absolute top-0 left-0 right-0 h-[30px] bg-gradient-to-b from-black/60 to-transparent z-20"></div>
          </>
        )}
        <div className="absolute inset-0 z-30 flex flex-col">
          {/* Progress bar - hidden in fullscreen mode */}
          {!isFullscreenMode && (
          <StoryProgressBar
            stories={stories}
            currentStoryIndex={currentStoryIndex}
            currentSlideIndex={currentSlideIndex}
            isPaused={isPaused}
            animationKey={animationKey}
              onAnimationEnd={isLastSlide ? () => {} : goToNextSlide}
            videoDuration={videoDuration}
              currentStory={currentStory}
          />
          )}
          
          {/* Header with avatar and name - hidden in fullscreen mode */}
          {!isFullscreenMode && (
            <div className="pt-5 p-3 flex items-center gap-3" data-share-exclude="true">
              <Avatar className="h-11 w-11 bg-white p-1">
                <AvatarImage src={currentStory.user.avatar} alt={currentStory.user.name} className="object-contain" />
              <AvatarFallback>{currentStory.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-white font-semibold text-sm drop-shadow-md">{currentStory.user.name}</span>
          </div>
          )}

          {/* Clickable tap zones for navigation - hidden in fullscreen mode */}
          {!isFullscreenMode && (
            <div className="flex-grow flex relative">
              <div 
                className="w-1/3 h-full" 
                onClick={goToPrevSlide} 
                aria-label="Previous slide"
              />
              {!isLastSlide && (
                <div 
                  className="w-2/3 h-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextSlide(e);
                  }} 
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                  }}
                  aria-label="Next slide"
                />
              )}
          </div>
          )}
        </div>

        {/* Standalone navigation buttons - hidden in fullscreen mode */}
        {!isFullscreenMode && (
          <>
            <button onClick={goToPrevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white transition-colors bg-black/20 rounded-full p-2 backdrop-blur-sm" aria-label="Previous Story" data-share-exclude="true">
            <ChevronLeft size={32} />
        </button>
            {!isLastSlide && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextSlide(e);
                }} 
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white transition-colors bg-black/20 rounded-full p-2 backdrop-blur-sm" 
                aria-label="Next Story"
                data-share-exclude="true"
              >
            <ChevronRight size={32} />
        </button>
            )}
          </>
        )}
        {/* Mute/Unmute button - hidden in fullscreen mode */}
        {!isFullscreenMode && (
        <button 
          onClick={() => setIsMuted(!isMuted)} 
            className="absolute top-3 right-14 z-40 text-white/80 hover:text-white transition-colors p-2" 
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          data-share-exclude="true"
        >
            {isMuted ? <VolumeX size={36} /> : <Volume2 size={36} />}
        </button>
        )}
        {/* Close button - hidden in fullscreen mode */}
        {!isFullscreenMode && (
          <button onClick={handleClose} className="absolute top-3 right-3 z-40 text-white/80 hover:text-white transition-colors p-2 drop-shadow-none" aria-label="Close stories" data-share-exclude="true">
              <X size={36} />
        </button>
        )}

        {/* Share Button - hidden in fullscreen mode */}
        {!isFullscreenMode && (
          <>
            {/* Belanja Sekarang Button - only for screen-2 when trxCount is 0, positioned above Share button */}
            {currentSlide?.id === 'screen-2' && serverResponse?.trxCount === 0 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[60] pointer-events-auto">
                <button
                  className="px-8 py-3 rounded-full font-bold text-sm transition-transform active:scale-95 pointer-events-auto"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    color: '#006041'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    track('inviteShopping', 'deeplink');
                    // TODO: Add navigation to shop page via handleDeeplink
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {t('screen2Notrx.button')}
                </button>
              </div>
            )}

            {/* Share Button - show on screen-2 through screen-12 (excluding screen-1) */}
            {(currentSlide?.id === 'screen-2' || currentSlide?.id === 'screen-3' || currentSlide?.id === 'screen-4' || currentSlide?.id === 'screen-5' || currentSlide?.id === 'screen-6' || currentSlide?.id === 'screen-7' || currentSlide?.id === 'screen-8' || currentSlide?.id === 'screen-9' || currentSlide?.id === 'screen-10' || currentSlide?.id === 'screen-11' || currentSlide?.id === 'screen-12') && (
              <ShareButton
                onClick={handleShareButtonClick}
              />
            )}

            {/* Share Button on last slide (screen-13) - opens modal */}
            {isLastSlide && currentSlide?.id === 'screen-13' && (
              <ShareButton
                onClick={handleShareModalOpen}
              />
            )}
          </>
        )}

        {/* Share Modal for last slide */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          slides={getSlideList()}
          onCaptureSlide={handleCaptureSlide}
        />
      </div>
    </div>
  );
}
