const CACHE_NAME = 'golpakar-v7-offline-ready';
const EXTERNAL_CACHE = 'golpakar-external-assets';

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'index.tsx',
  'App.tsx',
  'types.ts',
  'metadata.json',
  'sw.js',
  'services/gemini.ts',
  'components/Header.tsx',
  'components/Sidebar.tsx',
  'components/StoryDisplay.tsx',
  'components/HistoryPanel.tsx'
];

const EXTERNAL_RESOURCES = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/',
  'https://esm.sh/@google/genai@^1.34.0',
  'https://esm.sh/html2pdf.js@0.10.1',
  'https://esm.sh/docx@9.1.0',
  'https://esm.sh/file-saver@2.0.5',
  'https://www.transparenttextures.com/patterns/natural-paper.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
      caches.open(EXTERNAL_CACHE).then((cache) => cache.addAll(EXTERNAL_RESOURCES))
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME && name !== EXTERNAL_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Strategy for external libraries: Cache First
  // We want these heavy libs to load instantly from cache after the first time
  if (EXTERNAL_RESOURCES.some(res => url.startsWith(res)) || url.includes('esm.sh') || url.includes('fonts.')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(EXTERNAL_CACHE).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        });
      })
    );
    return;
  }

  // Strategy for app assets: Stale While Revalidate
  // This ensures the user gets the cached version immediately, but updates in the background
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If we're on a proxied environment (like some preview tools), we might get 0 status.
          // We only cache successful or "opaque" (0) responses.
          if (networkResponse.status === 200 || networkResponse.status === 0) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Silent catch for network errors - we'll just return the cached version
          return null;
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});