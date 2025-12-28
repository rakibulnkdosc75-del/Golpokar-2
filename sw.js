
const CACHE_NAME = 'golpakar-v8-final';
const EXTERNAL_CACHE = 'golpakar-external-assets-v8';

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
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, { cache: 'reload' })))),
      caches.open(EXTERNAL_CACHE).then((cache) => cache.addAll(EXTERNAL_RESOURCES.map(url => new Request(url, { mode: 'no-cors' }))))
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

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Cache external fonts and libraries for offline use
        const url = event.request.url;
        if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com') || url.includes('esm.sh')) {
          const responseToCache = networkResponse.clone();
          caches.open(EXTERNAL_CACHE).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        // Return index.html for navigation requests if offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return null;
      });
    })
  );
});
