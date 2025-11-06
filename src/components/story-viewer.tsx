"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Story } from '@/types/story';
import Image from 'next/image';
import { StoryProgressBar } from './story-progress-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex?: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialStoryIndex = 0, onClose }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const currentStory = stories[currentStoryIndex];
  const currentSlide = currentStory?.slides[currentSlideIndex];

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

  const handlePointerDown = () => setIsPaused(true);
  const handlePointerUp = () => setIsPaused(false);

  if (!currentStory || !currentSlide) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center font-body backdrop-blur-sm">
      <div 
        className="relative w-full max-w-[430px] aspect-[9/16] bg-primary rounded-lg overflow-hidden shadow-2xl select-none touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="dialog"
        aria-modal="true"
        aria-label={`Story by ${currentStory.user.name}`}
      >
        {/* Slides Container */}
        <div className="absolute inset-0">
          {currentStory.slides.map((slide, index) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: index === currentSlideIndex ? 1 : 0,
                zIndex: index === currentSlideIndex ? 10 : 1,
              }}
            >
              {slide.type === 'image' && slide.url && (
                <Image
                  src={slide.url}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={index === currentSlideIndex}
                  data-ai-hint={slide.aiHint}
                />
              )}
              {slide.type === 'component' && (
                <div className="w-full h-full">{slide.component}</div>
              )}
            </div>
          ))}
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
        <button onClick={onClose} className="absolute top-3 right-3 z-40 text-white/80 hover:text-white transition-colors" aria-label="Close stories">
            <X size={32} />
        </button>
      </div>
    </div>
  );
}
