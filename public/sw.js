// Pokemon Searchlight Edition — service worker.
// PRD §Performance: cache the app shell for offline play, and (in
// future) cache AI-generated scene payloads from /api/scene.
//
// v0 caches the static app bundle. The scene-cache strategy is
// in place but `/api/scene/*` is a stub URL today; once the real
// backend lands, this SW will transparently cache its responses.

const CACHE_VERSION = 'searchlight-v1';
const APP_SHELL = ['/', '/index.html', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Same-origin only.
  if (url.origin !== self.location.origin) return;

  // Strategy:
  //   /api/scene/*      → stale-while-revalidate (long-lived scene assets)
  //   built bundle      → cache-first
  //   navigations       → network-first w/ cache fallback (for offline)
  if (url.pathname.startsWith('/api/scene/')) {
    event.respondWith(staleWhileRevalidate(event.request));
  } else if (url.pathname.match(/\.(js|css|svg|png|jpg|webp|woff2)$/)) {
    event.respondWith(cacheFirst(event.request));
  } else if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  const cache = await caches.open(CACHE_VERSION);
  cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(CACHE_VERSION);
    cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw new Error('offline and not cached');
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  const networkP = fetch(req)
    .then((res) => {
      cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached ?? (await networkP) ?? new Response('offline', { status: 503 });
}
