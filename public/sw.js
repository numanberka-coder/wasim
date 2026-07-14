// Service worker: PWA'yi Android Chrome'da yuklenebilir (standalone) yapar ve
// cevrimdisi calismayi saglar. Guncelleme-guvenli strateji:
//   - Navigasyon/HTML: network-first (online iken her zaman taze index.html;
//     boylece yeni deploy'daki hash'li asset'ler otomatik yuklenir).
//   - Diger GET (hash'li js/css, gorseller): stale-while-revalidate.
// Cache adi surumlenir; activate'te eski cache'ler silinir.
const CACHE = 'wa-sim-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isNavigation(req) {
  return req.mode === 'navigate' ||
    (req.method === 'GET' && (req.headers.get('accept') || '').includes('text/html'));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const sameOrigin = new URL(req.url).origin === self.location.origin;

  // HTML/navigasyon: once agdan; basarisizsa cache'ten (cevrimdisi).
  if (isNavigation(req)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && sameOrigin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
    );
    return;
  }

  // Diger istekler: cache'ten hizli don, arka planda agdan tazele.
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok && sameOrigin) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || network;
      })
    )
  );
});
