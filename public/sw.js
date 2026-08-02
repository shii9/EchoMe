const CACHE_NAME = 'phishing-detector-v2';
const APP_SCOPE = new URL('./', self.registration.scope).href;
const urlsToCache = [
  APP_SCOPE,
  new URL('index.html', APP_SCOPE).href,
  new URL('manifest.json', APP_SCOPE).href
];

self.addEventListener('install', (event) => {
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

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
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
