// Minimal service worker for Nexora PWA
const CACHE = 'nexora-v1';
const OFFLINE_URLS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(OFFLINE_URLS);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const fresh = await fetch(event.request);
      return fresh;
    } catch (e) {
      // last resort: offline root
      return caches.match('/');
    }
  })());
});
