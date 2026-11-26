const SHELL_CACHE = 'vialert-shell-v2';
const RUNTIME_CACHE = 'vialert-runtime-v2';

const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/brand/logo-horizontal.png',
  '/brand/logo-compact.png',
  '/brand/isotype-color.png',
  '/icons/favicon-32.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/fonts/poppins-400-latin.woff2',
  '/fonts/poppins-600-latin.woff2',
  '/fonts/poppins-700-latin.woff2'
];

const precacheBuiltAssets = async (cache) => {
  const response = await fetch('/');
  const html = await response.clone().text();
  await cache.put('/', response);
  const assetUrls = [...html.matchAll(/(?:src|href)="(\/[^"#?]+(?:\?[^"#]*)?)"/g)]
    .map((match) => match[1]);
  await cache.addAll([...new Set(assetUrls)]);
};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then(async (cache) => {
    await cache.addAll(APP_SHELL);
    await precacheBuiltAssets(cache);
  }));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (
          (await caches.match(request)) || (await caches.match('/'))
        )),
    );
    return;
  }

  if (['script', 'style', 'image', 'font', 'manifest'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })),
    );
  }
});
