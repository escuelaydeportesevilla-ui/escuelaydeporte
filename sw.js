const CACHE_NAME = 'clubos-sfc-v1';
const ASSETS_TO_CACHE = [
  './clubos_sfc.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './clubos-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Nunca cachear llamadas a Google Apps Script: los datos siempre deben venir frescos de la red
  if (url.includes('script.google.com')) {
    return;
  }

  // Para el resto de recursos (HTML, manifest, iconos): red primero, caché como respaldo offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
