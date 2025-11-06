
"use client";

import { useEffect, useState } from 'react';
import type { Story } from '@/types/story';
import { StoryViewer } from '@/components/story-viewer';
import { LoadingSpinner } from '@/components/loading-spinner';
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
        const storiesData: Story[] = storyData;

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
        setShowStories(true); // Automatically show stories when loaded
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);
  
  // This effect will handle closing the viewer and navigating back, 
  // though in this setup it might just show a blank page.
  // A more robust solution might redirect to a different page or show a "Thanks for watching" message.
  const handleClose = () => {
    setShowStories(false);
    // Potentially redirect or show a different component here
  };
  
  if (showStories) {
    return <StoryViewer stories={stories} onClose={handleClose} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-headline text-5xl font-bold text-primary mb-4">StorySwipe</h1>
        
        {isLoading && (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            <p>Loading stories...</p>
          </div>
        )}
        
        {error && (
          <div>
            <p className="text-destructive mb-4">Error: {error}</p>
            <p className="text-muted-foreground">Could not load stories. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && !showStories && (
            <div className="flex items-center justify-center gap-2">
                <p>Finished viewing stories.</p>
            </div>
        )}
      </div>
    </main>
  );
}
