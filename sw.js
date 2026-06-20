const CACHE_NAME = 'clubos-sfc-v2';
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
  self.skipWaiting(); // activa la nueva versión inmediatamente, sin esperar a cerrar pestañas
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim(); // toma el control de las pestañas abiertas de inmediato
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Nunca cachear llamadas a Google Apps Script: los datos siempre deben venir frescos de la red
  if (url.includes('script.google.com')) {
    return;
  }

  // Red primero, sin usar caché HTTP del navegador (cache:'no-store' fuerza ir siempre al servidor)
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

