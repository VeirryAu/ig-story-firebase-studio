"use client";

import type { Story } from '@/types/story';

interface StoryProgressBarProps {
  stories: Story[];
  currentStoryIndex: number;
  currentSlideIndex: number;
  isPaused: boolean;
  animationKey: number; // To restart animation
  onAnimationEnd: () => void;
}

export function StoryProgressBar({
  stories,
  currentStoryIndex,
  currentSlideIndex,
isPaused,
  animationKey,
  onAnimationEnd,
}: StoryProgressBarProps) {
  const currentStory = stories[currentStoryIndex];
  if (!currentStory) return null;

  const duration = currentStory.slides[currentSlideIndex]?.duration || 10000;

  return (
    <div className="absolute top-2 left-0 right-0 z-20 flex gap-1 px-2" aria-hidden="true">
      {currentStory.slides.map((slide, index) => (
        <div
          key={slide.id}
          className="relative h-1 flex-1 rounded-full bg-white/40 overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 h-full bg-white transform-gpu"
            style={{
              width: '100%',
              transform: index < currentSlideIndex ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              ...(index === currentSlideIndex && {
                animationName: 'progressBarFill',
                animationDuration: `${duration}ms`,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards',
                animationPlayState: isPaused ? 'paused' : 'running',
              }),
            }}
            key={`${animationKey}-${index}`}
            onAnimationEnd={() => {
              if (index === currentSlideIndex) {
                onAnimationEnd();
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}
