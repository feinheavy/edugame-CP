const CACHE_NAME = 'progames-v2';

const urlsToCache = [
  'index.html',
  'maze.html',
  'shooting.html',
  'monopoly.html',
  'quiz2p.html',
  'quiz.html',
  'pushbox.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// ─── INSTALL: cache all files ─────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching files');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE: remove old caches ─────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH: serve from cache, fallback to network ─────────
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response; // serve from cache
      }
      return fetch(event.request).then(networkResponse => {
        // Cache new requests on the fly
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // Offline fallback - return index.html for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('index.html');
      }
    })
  );
});