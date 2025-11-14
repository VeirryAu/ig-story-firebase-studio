
"use client";

import { useEffect, useState, useRef } from 'react';
import type { Story } from '@/types/story';
import { StoryViewer } from '@/components/story-viewer';
import { LoadingSpinner } from '@/components/loading-spinner';
import { stories as storyData } from '@/lib/story-data.tsx';
import config from '@/lib/const.json';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStories, setShowStories] = useState(false);
  const audioPreloadRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio as early as possible for offline mode with progressive loading
  useEffect(() => {
    // Start preloading background music immediately with progressive loading
    const audio = new Audio(config.backgroundMusic);
    audio.preload = 'metadata'; // Start with metadata for faster initial load
    audio.muted = true; // Muted during preload to avoid any autoplay issues
    audio.volume = 0;
    audio.crossOrigin = 'anonymous'; // Better caching support
    
    // Progressive loading: Load metadata first, then buffer
    const handleMetadataLoaded = () => {
      audio.preload = 'auto'; // Switch to auto after metadata loads
      // Trigger progressive buffering
      if (audio.duration > 0) {
        audio.currentTime = Math.min(1, audio.duration * 0.1);
        setTimeout(() => {
          audio.currentTime = 0;
        }, 50);
      }
    };
    
    audio.addEventListener('loadedmetadata', handleMetadataLoaded, { once: true });
    
    // Also prefetch using link element for better caching
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'audio';
    link.href = config.backgroundMusic;
    document.head.appendChild(link);
    
    // Start loading
    audio.load();
    audioPreloadRef.current = audio;
    
    return () => {
      if (audioPreloadRef.current) {
        audioPreloadRef.current.pause();
        audioPreloadRef.current = null;
      }
      const existingLink = document.head.querySelector(`link[href="${config.backgroundMusic}"]`);
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(
          (registration) => {
            console.log('Service Worker registration successful with scope: ', registration.scope);
            
            // Check for updates periodically (every hour)
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
            
            // Also check for updates when the page becomes visible
            document.addEventListener('visibilitychange', () => {
              if (!document.hidden) {
                registration.update();
              }
            });
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
