// Service Worker v1.4 - 身体図式・脳内GPSドック
const CACHE_NAME = 'brain-gps-dock-v1.4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800;900&family=Montserrat:wght@800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ネットワーク優先（Network-First）戦略
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
