"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Story } from '@/types/story';
import Image from 'next/image';
import { StoryProgressBar } from './story-progress-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useVideoPreload } from '@/hooks/use-video-preload';
import { useBackgroundMusic } from '@/hooks/use-background-music';
import { useAudioPreload } from '@/hooks/use-audio-preload';
import config from '@/lib/const.json';

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex?: number;
  onClose: () => void;
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
  
  // For screen-14, we need to handle multiple sources
  const isScreen14 = slideId === 'screen-14';

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
        video.play().catch((error) => {
          // Autoplay with sound might be blocked - show play button
          if (error.name === 'NotAllowedError') {
            setNeedsUserInteraction(true);
          }
        });
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
    if (!video || slideId !== 'screen-14') return;

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
        video.play().catch(() => {
          // Auto-play might be blocked
        });
      }
    }
  }, [isActive, isPaused, canPlay]);

  return (
    <>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
        aria-label={alt}
      >
        {isScreen14 ? (
          <>
            <source src="/stories-asset/slides14/forecap-video-barista-av1.mp4" type='video/mp4; codecs="av01.0.05M.08"' />
            <source src="/stories-asset/slides14/forecap-video-barista.webm" type='video/webm; codecs="vp9"' />
            <source src="/stories-asset/slides14/forecap-video-barista-h264.mp4" type='video/mp4; codecs="avc1.42E01E"' />
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
    </>
  );
}

export function StoryViewer({ stories, initialStoryIndex = 0, onClose }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const currentStory = stories[currentStoryIndex];
  const currentSlide = currentStory?.slides[currentSlideIndex];
  
  // Check if current slide is video (slide 14) - no background music for videos
  const isVideoSlide = currentSlide?.type === 'video';
  
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
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Ensure audio plays when conditions change
  useEffect(() => {
    if (audioReady && !isPaused && !isVideoSlide && currentSlideIndex >= 0 && !isMuted) {
      playAudio();
    }
  }, [audioReady, isPaused, isVideoSlide, currentSlideIndex, isMuted, playAudio]);

  // Find video slides and preload them starting from slide 1
  const videoSlides = currentStory?.slides.filter(slide => slide.type === 'video') || [];
  const videoSources = videoSlides.map(slide => {
    // For screen-14, we have multiple sources - preload all formats
    if (slide.id === 'screen-14') {
      return [
        { src: '/stories-asset/slides14/forecap-video-barista-av1.mp4', type: 'video/mp4; codecs="av01.0.05M.08"' },
        { src: '/stories-asset/slides14/forecap-video-barista.webm', type: 'video/webm; codecs="vp9"' },
        { src: '/stories-asset/slides14/forecap-video-barista-h264.mp4', type: 'video/mp4; codecs="avc1.42E01E"' },
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
      if (currentSlide?.id === 'screen-14') {
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
    if (currentSlide?.id !== 'screen-14') {
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

  const goToNextSlide = useCallback(() => {
    if (currentStory && currentSlideIndex < currentStory.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      resetAnimation();
    } else {
      goToNextStory();
    }
  }, [currentStory, currentSlideIndex, goToNextStory, resetAnimation]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentSlideIndex(0);
      resetAnimation();
    }
  }, [currentStoryIndex, resetAnimation]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      resetAnimation();
    } else {
      goToPrevStory();
    }
  }, [currentSlideIndex, goToPrevStory, resetAnimation]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextSlide();
      if (e.key === 'ArrowLeft') goToPrevSlide();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, onClose]);

  const handlePointerDown = () => {
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

  if (!currentStory || !currentSlide) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center font-body backdrop-blur-sm">
      <div 
        ref={containerRef}
        className="relative w-full max-w-[430px] aspect-[9/16] bg-primary rounded-lg overflow-hidden shadow-2xl select-none touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleInitialInteraction}
        onTouchStart={handleInitialInteraction}
        onMouseDown={handleInitialInteraction}
        onKeyDown={(e) => {
          handleInitialInteraction();
          // Also handle keyboard navigation
          if (e.key === 'ArrowRight') goToNextSlide();
          if (e.key === 'ArrowLeft') goToPrevSlide();
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
                  <div className="w-full h-full">{slide.component}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overlay with UI elements */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-black/50"></div>
        <div className="absolute inset-0 z-30 flex flex-col">
          <StoryProgressBar
            stories={stories}
            currentStoryIndex={currentStoryIndex}
            currentSlideIndex={currentSlideIndex}
            isPaused={isPaused}
            animationKey={animationKey}
            onAnimationEnd={goToNextSlide}
            videoDuration={videoDuration}
          />
          
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/80">
              <AvatarImage src={currentStory.user.avatar} alt={currentStory.user.name} />
              <AvatarFallback>{currentStory.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-white font-semibold text-sm drop-shadow-md">{currentStory.user.name}</span>
          </div>

          {/* Clickable tap zones for navigation */}
          <div className="flex-grow flex">
            <div className="w-1/3 h-full" onClick={goToPrevSlide} aria-label="Previous slide"></div>
            <div className="w-2/3 h-full" onClick={goToNextSlide} aria-label="Next slide"></div>
          </div>
        </div>

        {/* Standalone navigation buttons for non-touch devices and accessibility */}
        <button onClick={goToPrevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white transition-colors bg-black/20 rounded-full p-2 hidden md:block" aria-label="Previous Story">
            <ChevronLeft size={32} />
        </button>
        <button onClick={goToNextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white transition-colors bg-black/20 rounded-full p-2 hidden md:block" aria-label="Next Story">
            <ChevronRight size={32} />
        </button>
        {/* Mute/Unmute button - show on all slides */}
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="absolute top-3 right-14 z-40 text-white/80 hover:text-white transition-colors bg-black/20 rounded-full p-2" 
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <button onClick={onClose} className="absolute top-3 right-3 z-40 text-white/80 hover:text-white transition-colors bg-black/20 rounded-full p-2" aria-label="Close stories">
            <X size={24} />
        </button>
      </div>
    </div>
  );
}
