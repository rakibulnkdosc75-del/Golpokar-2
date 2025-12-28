
const CACHE_NAME = 'golpakar-v2';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'index.tsx',
  'App.tsx',
  'types.ts',
  'metadata.json',
  'services/gemini.ts',
  'components/Header.tsx',
  'components/Sidebar.tsx',
  'components/StoryDisplay.tsx',
  'components/HistoryPanel.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // Silent catch for network failures
        });

        return cachedResponse || fetchedResponse;
      });
    })
  );
});
