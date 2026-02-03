
const CACHE_NAME = 'learncraft-v3';
const OFFLINE_URL = 'offline.html';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './components/theme-toggle.js',
  './components/stamp-button.js',
  'https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js',
  './Bilder/Hydraulikoele.jpg',
  './Bilder/Reifen.png',
  './Bilder/Rechner.png',
  './Bilder/fahrzeugausweis.jpg',
  './Bilder/Laerm.png',
  './Bilder/alufelgen.jpg',
  './Bilder/kraft.png',
  './Bilder/Bremsen.png',
  './Bilder/reifenverschleiss.png',
  OFFLINE_URL
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        }).catch(() => {
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }
        });
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'updateCache') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(ASSETS);
    });
  }
});