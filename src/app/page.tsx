
"use client";

import { useEffect, useState, useRef } from 'react';
import type { Story } from '@/types/story';
import type { ServerResponse } from '@/types/server';
import { StoryViewer } from '@/components/story-viewer';
import { LoadingSpinner } from '@/components/loading-spinner';
import { stories as storyData } from '@/lib/story-data';
import config from '@/lib/const.json';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStories, setShowStories] = useState(false);
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>(null);
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

    async function fetchServerResponse(): Promise<ServerResponse> {
      // TODO: Replace this with your actual backend API endpoint
      // Example: const response = await fetch('/api/user-data');
      // return await response.json();
      
      // For development, you can use a mock response
      // Change trxCount to 0 to test the limited slides scenario
      if (process.env.NODE_ENV === 'development') {
        // Mock response for development
        // Set trxCount to 0 to test limited slides (only slide1 and slide2)
        // Set trxCount to any number > 0 to show all slides
        return {
          userName: 'John',
          variantCount: 4,
          trxCount: config.devTrxCount, // Change to 0 to test limited slides
          listProductFavorite: [
            { 
              productName: 'Espresso', 
              countCups: 12,
              productImage: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop&crop=center'
            },
            { 
              productName: 'Cappuccino', 
              countCups: 8,
              productImage: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop&crop=center'
            },
            { 
              productName: 'Latte', 
              countCups: 6,
              productImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&crop=center'
            },
            { 
              productName: 'Americano', 
              countCups: 4,
              productImage: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop&crop=center'
            },
          ],
          totalPoint: 450, // Total points accumulated
          totalPointDescription: 'Poin itu bisa kamu tukarkan dengan 10 cup Butterscotch Sea Salt Latte di FOREwards lho!',
          totalPointPossibleRedeem: 10, // Number of items that can be redeemed
          totalPointImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&crop=center', // Coffee latte image
        };
      }
      
      // Production: Fetch from your backend
      try {
        const response = await fetch('/api/user-data');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return await response.json();
      } catch (err) {
        console.error('Failed to fetch server response:', err);
        // Fallback to default values
        return {
          userName: 'User',
          trxCount: 0,
        };
      }
    }

    async function loadData() {
      try {
        // Fetch server response first
        const serverData = await fetchServerResponse();
        setServerResponse(serverData);

        const storiesData: Story[] = storyData;

        const imageUrls: string[] = [];
        // Preload the logo
        imageUrls.push('/stories-asset/main/fore-logo.svg');
        // Preload first slide logo
        imageUrls.push('/stories-asset/slides01/slide1-logo.png');
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
    return <StoryViewer stories={stories} onClose={handleClose} serverResponse={serverResponse || undefined} />;
  }

  return (
    <main 
      className="flex min-h-screen flex-col items-center justify-center p-8"
      style={{ backgroundColor: '#222126' }}
    >
      <div className="text-center">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="bg-white rounded-full p-2 flex items-center justify-center">
              <img 
                src="/stories-asset/main/fore-logo.svg" 
                alt="Fore Logo" 
                className="w-12 h-12"
              />
            </div>
            <div className="text-white text-lg md:text-xl font-bold leading-relaxed whitespace-pre-line">
              Take a seat, have a sip!{"\n"}
              While we're doing the math for you!
            </div>
            <LoadingSpinner />
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
                <p className="text-white">Finished viewing stories.</p>
            </div>
        )}
      </div>
    </main>
  );
}
