
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
          deliveryCount: 10, // Number of delivery transactions
          pickupCount: 20, // Number of pickup transactions
          cheaperSubsDesc: '325rb Rupiah', // Savings description
          cheaperSubsAmount: 325500, // Savings amount in rupiah
          topRanking: 50, // Top ranking position
          listCircularImages: [
            'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop&crop=center',
          ], // Array of circular image URLs for screen-12
          listFavoriteStore: [
            {
              storeName: 'Fore Coffee Grand Indonesia',
              transactionCount: 25,
              storeImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop&crop=center'
            },
            {
              storeName: 'Fore Coffee Plaza Senayan',
              transactionCount: 18,
              storeImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop&crop=center'
            },
            {
              storeName: 'Fore Coffee Central Park',
              transactionCount: 15,
              storeImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop&crop=center'
            },
          ],
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
        
        // Preload all static image assets from stories-asset directory
        const staticAssets = [
          // Main assets
          '/stories-asset/main/fore-logo.svg',
          // Slide 1
          '/stories-asset/slides01/slide1-logo.png',
          // Slide 2
          '/stories-asset/slides02/fore-cup-logo.svg',
          '/stories-asset/slides02/slide-2-decoration.svg',
          // Slide 4 (both variants)
          '/stories-asset/slides04/slide04-more-five.jpg',
          '/stories-asset/slides04/slide04-less-five.jpg',
          // Slide 6 (all time-based variants)
          '/stories-asset/slides06/slide6-daybreakcatcher.jpg',
          '/stories-asset/slides06/slide6-sunchaser.jpg',
          '/stories-asset/slides06/slide6-twilightseeker.jpg',
          // Slide 8 (both variants)
          '/stories-asset/slides08/slide-8-delivery.jpg',
          '/stories-asset/slides08/slide-8-pickup.jpg',
          // Slide 10
          '/stories-asset/slides10/slide10-myforeplan.png',
          // Slide 11
          '/stories-asset/slides11/slide11-bgasset.png',
          // Slide 14 (banner images)
          '/stories-asset/slides14/app-banner.jpg',
          '/stories-asset/slides14/app-banner-smaller.jpg',
        ];
        
        // Add all static assets to preload list
        staticAssets.forEach(asset => imageUrls.push(asset));
        
        // Preload story user avatars
        storiesData.forEach(story => {
          imageUrls.push(story.user.avatar);
          story.slides.forEach(slide => {
            if (slide.type === 'image' && slide.url) {
              imageUrls.push(slide.url)
            }
          });
        });

        // Add circular images from serverResponse for screen-12
        if (serverData?.listCircularImages && Array.isArray(serverData.listCircularImages)) {
          serverData.listCircularImages.forEach(imageUrl => {
            if (imageUrl) {
              imageUrls.push(imageUrl);
            }
          });
        }

        // Preload screen-5 image from serverResponse
        if (serverData?.totalPointImage) {
          imageUrls.push(serverData.totalPointImage);
        }
        
        // Preload product favorite images from serverResponse
        if (serverData?.listProductFavorite && Array.isArray(serverData.listProductFavorite)) {
          serverData.listProductFavorite.forEach(product => {
            if (product.productImage) {
              imageUrls.push(product.productImage);
            }
          });
        }
        
        // Preload favorite store images from serverResponse
        if (serverData?.listFavoriteStore && Array.isArray(serverData.listFavoriteStore)) {
          serverData.listFavoriteStore.forEach(store => {
            if (store.storeImage) {
              imageUrls.push(store.storeImage);
            }
          });
        }

        const imagePromises = imageUrls.map(url => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = () => {
              // Log error but don't fail the entire preload process
              console.warn(`Failed to preload image: ${url}`);
              // Resolve instead of reject to allow other images to continue loading
              resolve(null);
            };
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
                <p className="text-white"></p>
            </div>
        )}
      </div>
    </main>
  );
}
