const CACHE_NAME = 'gps-dock-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
  'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;900&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // CDNリソースはCORSの問題を避けるためno-corsモードで追加するよう工夫するか、
        // 必須なローカルアセットのみキャッシュしてCDNはネットワークファーストにするのが安全です。
        return cache.addAll(ASSETS_TO_CACHE.filter(url => url.startsWith('./')));
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // CDNや外部リソースはネットワークファースト、ローカルはキャッシュファースト等の戦略
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // 外部CDN等はここで動的キャッシュも可能ですが、ストレージ圧迫を防ぐため今回はそのまま返します
            return response;
          }
        );
      })
  );
});
