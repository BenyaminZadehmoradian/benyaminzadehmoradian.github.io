/* =============================================================
   sw.js — Service Worker (PWA Offline Support)
   Cache Strategy: Cache First for assets, Network First for HTML
   ============================================================= */

const CACHE_NAME   = 'benyamin-resume-v4';
const OFFLINE_PAGE = '/offline.html';

/* Files to cache immediately on install */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/styles.css',
  '/assets/js/script.js',
  '/assets/fonts/Formula1-Regular_web_0.woff',
  '/assets/fonts/Formula1-Bold_web_0.woff',
  '/assets/fonts/Formula1-Wide_web_0.woff',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
];

/* ── Install: pre-cache assets ───────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean old caches ──────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: Cache-first for assets, Network-first for HTML ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (except whitelisted CDNs)
  if (request.method !== 'GET') return;

  // HTML pages — Network first, fall back to cache, then offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match(OFFLINE_PAGE))
        )
    );
    return;
  }

  // Assets — Cache first, fall back to network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      }).catch(() => new Response('', { status: 408 }));
    })
  );
});
