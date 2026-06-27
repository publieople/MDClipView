const CACHE = 'mdclipview-v1';

const PRECACHE = [
  '/MDClipView/',
  '/MDClipView/index.html',
  '/MDClipView/settings.html',
  '/MDClipView/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // For CDN assets (marked, hljs), cache first
  if (e.request.url.includes('cdn.jsdelivr.net')) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        return res;
      }))
    );
  } else {
    // For app files, network first, fallback to cache
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});
