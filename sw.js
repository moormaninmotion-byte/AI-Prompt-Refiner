// A unique name for the cache, updated to reflect the current version.
const CACHE_NAME = 'ai-prompt-refiner-cache-v2';

// List of essential assets to be cached upon installation.
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/vite.svg',
];

// Service worker installation event.
self.addEventListener('install', event => {
  // Pre-cache application shell and essential assets.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Service worker fetch event to handle network requests.
self.addEventListener('fetch', event => {
  // We only handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For navigation requests (e.g., loading the page), use a network-first strategy
  // falling back to the cached index.html for offline support.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  // For other requests (scripts, styles, etc.), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request).then(response => {
      // If the resource is in the cache, return it.
      if (response) {
        return response;
      }
      
      // Otherwise, fetch from the network.
      return fetch(event.request).then(fetchResponse => {
        // After fetching, cache the new resource for future offline use.
        return caches.open(CACHE_NAME).then(cache => {
          // Only cache successful responses from our origin or the trusted CDN.
          const isCacheable = fetchResponse.ok && 
                              (new URL(event.request.url).origin === self.location.origin || 
                               new URL(event.request.url).hostname.includes('aistudiocdn.com'));
          if (isCacheable) {
             cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});

// Service worker activation event.
self.addEventListener('activate', event => {
  // Define a whitelist of cache names to keep.
  const cacheWhitelist = [CACHE_NAME];
  
  // Clean up old caches that are no longer needed.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
