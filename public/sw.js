// Minimal service worker: runtime cache-first for same-origin GET requests.
// Amaci PWA'yi Android Chrome'da yuklenebilir (standalone) yapmak ve cevrimdisi calistirmak.
const CACHE = 'wa-sim-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          // Yalnizca ayni origin ve basarili yanitlari cache'le.
          if (res.ok && new URL(req.url).origin === self.location.origin) {
            cache.put(req, res.clone());
          }
          return res;
        }).catch(() => hit)
      )
    )
  );
});
