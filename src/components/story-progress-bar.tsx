"use client";

import type { Story } from '@/types/story';

interface StoryProgressBarProps {
  stories: Story[];
  currentStoryIndex: number;
  currentSlideIndex: number;
  isPaused: boolean;
  animationKey: number;
  onAnimationEnd: () => void;
  videoDuration?: number | null; // Optional video duration override
  currentStory?: Story; // Optional filtered story (takes precedence over stories[currentStoryIndex])
}

export function StoryProgressBar({
  stories,
  currentStoryIndex,
  currentSlideIndex,
  isPaused,
  animationKey,
  onAnimationEnd,
  videoDuration,
  currentStory: filteredStory,
}: StoryProgressBarProps) {
  // Use filtered story if provided, otherwise fall back to stories array
  const currentStory = filteredStory || stories[currentStoryIndex];
  if (!currentStory) return null;

  // Use video duration if available (for slide 14), otherwise use slide duration
  const slide = currentStory.slides[currentSlideIndex];
  const isVideoSlide = slide?.type === 'video' && slide?.id === 'screen-13';
  const duration = (isVideoSlide && videoDuration) ? videoDuration : (slide?.duration ?? 10000);

  return (
    <div
      className="absolute top-2 left-0 right-0 z-20 flex gap-1 px-2 story-progress-bar"
      aria-hidden="true"
      data-share-exclude="true"
    >
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
