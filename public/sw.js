// Service Worker Version - Update this when deploying new code
// Increment this version number each time you deploy to force cache refresh
const SW_VERSION = '1.0.4';
const CACHE_NAME = `storyswipe-v${SW_VERSION}`;
const TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const urlsToCache = [
  '/',
  '/index.html',
  // Add other static assets you want to cache here
];

// Install event - cache static assets and skip waiting for immediate activation
self.addEventListener('install', (event) => {
  console.log(`Service Worker installing with version ${SW_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`Service Worker activating with version ${SW_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all caches that don't match the current version pattern
          if (!cacheName.startsWith('storyswipe-v')) {
            return caches.delete(cacheName);
          }
          // Delete old version caches
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Helper function to check if cached response is expired
async function isCacheExpired(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (!cachedResponse) {
    return true; // No cache, consider it expired
  }

  // Check if response has a timestamp header
  const cacheDate = cachedResponse.headers.get('sw-cache-date');
  if (!cacheDate) {
    return true; // No timestamp, consider expired
  }

  const cacheTime = parseInt(cacheDate, 10);
  const now = Date.now();
  const isExpired = (now - cacheTime) > TTL;

  if (isExpired) {
    console.log('Cache expired for:', request.url);
  }

  return isExpired;
}

// Helper function to add timestamp to response
function addCacheTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-date', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Fetch event - implement cache with TTL and Range request support for progressive loading
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const request = event.request;
      const url = new URL(request.url);
      
      // Support Range requests for audio/video progressive loading
      const isMediaRequest = url.pathname.match(/\.(mp3|mp4|aac|webm|ogg|wav|m4a)$/i);
      const rangeHeader = request.headers.get('range');
      
      // Check if we have a cached response
      const cachedResponse = await caches.match(request);
      
      if (cachedResponse && !rangeHeader) {
        // Check if cache is still valid (not expired)
        const expired = await isCacheExpired(request);
        
        if (!expired) {
          console.log('Serving from cache:', request.url);
          return cachedResponse;
        } else {
          // Cache expired, delete it and fetch fresh
          console.log('Cache expired, fetching fresh:', request.url);
          const cache = await caches.open(CACHE_NAME);
          await cache.delete(request);
        }
      }

      // Fetch from network
      try {
        const fetchRequest = request.clone();
        let response = await fetch(fetchRequest);

        // Handle Range requests for progressive loading (audio/video)
        if (isMediaRequest && rangeHeader && response.status === 206) {
          // Partial content response - return as-is for progressive loading
          return response;
        }

        // Only cache successful responses (not partial/range requests)
        if (response && response.status === 200 && !rangeHeader) {
          const responseToCache = addCacheTimestamp(response.clone());
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, responseToCache);
          console.log('Cached response:', request.url);
        } else if (response && response.type === 'opaque') {
          // For opaque responses (like from picsum.photos), we can't inspect them but can cache them
          const responseToCache = addCacheTimestamp(response.clone());
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, responseToCache);
          console.log('Cached opaque response:', request.url);
        }

        return response;
      } catch (error) {
        console.error('Fetch failed:', error);
        // If fetch fails and we have a stale cache, return it
        if (cachedResponse && !rangeHeader) {
          console.log('Fetch failed, returning stale cache:', request.url);
          return cachedResponse;
        }
        throw error;
      }
    })()
  );
});
