'use strict';

const SCOPE = self.registration.scope;
const PREFIX = 'dial-console:' + SCOPE + ':';
const CACHE = PREFIX + 'v1';
const SHELL = ['./', './index.html', './styles.css', './logic.js', './db.js', './scripts-seed.js',
  './app.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-512.png', './icons/apple-touch-icon-180.png'];
const paths = new Set(SHELL.map(path => new URL(path, SCOPE).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    SHELL.map(path => new Request(new URL(path, SCOPE), { cache: 'reload' }))
  )));
});
self.addEventListener('message', event => {
  if (event.data === 'activate') event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const stored of await caches.keys()) {
      if (stored.startsWith(PREFIX) && stored !== CACHE) await caches.delete(stored);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  url.hash = '';
  if (!paths.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(url.href)) || fetch(event.request);
  })());
});
