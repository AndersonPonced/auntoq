// Service Worker mínimo para habilitar la instalación PWA (Add to Home Screen)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Este listener es el requisito de Chrome para disparar el prompt de instalación
self.addEventListener('fetch', (event) => {
  // Solo lo dejamos pasar (network-first)
  return;
});
