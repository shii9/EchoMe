const CACHE_NAME = 'echome-v3';
const APP_SCOPE = new URL('./', self.registration.scope).href;
const urlsToCache = [
  APP_SCOPE,
  new URL('index.html', APP_SCOPE).href,
  new URL('manifest.json', APP_SCOPE).href
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const scopeUrl = new URL(APP_SCOPE);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(scopeUrl.pathname)) {
    return;
  }

  const isNavigation = event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.html');
  event.respondWith(
    isNavigation
      ? fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => caches.match(event.request))
      : caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
