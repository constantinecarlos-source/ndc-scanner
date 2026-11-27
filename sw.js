const cacheName = 'ndc-v1.4';
const assets = ['./index.html', './manifest.json', './icon192.png', './icon512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(
    assets.map(url => new Request(url, { cache: 'reload' }))
  )).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all(['ndc-v1', 'ndc-v1.2', 'ndc-v1.3'].map(name => caches.delete(name)))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    if (request.mode === 'navigate') {
      return fetch(request).catch(() => cache.match('./index.html'));
    }
    return (await cache.match(request)) || fetch(request);
  })());
});
