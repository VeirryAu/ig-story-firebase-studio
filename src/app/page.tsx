
"use client";

import { useEffect, useState } from 'react';
import type { Story } from '@/types/story';
import { StoryViewer } from '@/components/story-viewer';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { stories as storyData } from '@/lib/story-data.tsx';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStories, setShowStories] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Service Worker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }

    async function loadData() {
      try {
        // 1. Use the imported story data
        const storiesData: Story[] = storyData;

        // 2. Preload all images
        const imageUrls: string[] = [];
        storiesData.forEach(story => {
          imageUrls.push(story.user.avatar);
          story.slides.forEach(slide => {
            if (slide.type === 'image' && slide.url) {
              imageUrls.push(slide.url)
            }
          });
        });

        const imagePromises = imageUrls.map(url => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          });
        });

        await Promise.all(imagePromises);

        setStories(storiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const openStoryViewer = () => {
    if (!isLoading && !error && stories.length > 0) {
      setShowStories(true);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-headline text-5xl font-bold text-primary mb-4">StorySwipe</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          An Instagram-like story viewer. Click the button below to view stories. All assets are preloaded for a smooth experience.
        </p>

        {isLoading && (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            <p>Loading stories...</p>
          </div>
        )}
        
        {error && (
          <p className="text-destructive">Error: {error}</p>
        )}

        {!isLoading && !error && (
          <Button onClick={openStoryViewer} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg transition-transform hover:scale-105" disabled={stories.length === 0}>
            View Stories
          </Button>
        )}
      </div>

      {showStories && (
        <StoryViewer stories={stories} onClose={() => setShowStories(false)} />
      )}
    </main>
  );
}
