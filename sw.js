/* =========================================================
   SERVICE WORKER — lets the installed app open offline.
   "Network first": online, every file comes fresh from the web (and a copy is saved);
   offline, the saved copy is used. Only the app's own files and its fonts are saved,
   never anything you type.
   ========================================================= */
const CACHE = 'ccc-v3'; // change the name to throw away all old copies

// Saved on the first visit, so the app works offline straight away.
// Add every new HTML, CSS, JS or icon file here.
const FILES = [
  './',
  'index.html',
  'app.html',
  'style.css',
  'manifest.webmanifest',
  'js/main.js',
  'js/utils.js',
  'js/data.js',
  'js/state.js',
  'js/progress.js',
  'js/english.js',
  'js/coach.js',
  'js/dashboard.js',
  'js/practice.js',
  'js/results.js',
  'js/library.js',
  'js/studio.js',
  'js/phrasebook.js',
  'js/pwa.js',
  'js/ai.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

// The Google Fonts servers: their files are saved too, after the first visit
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting(); // use the new version right away
});

// Delete copies saved under an old CACHE name
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const ours = url.origin === location.origin || FONT_HOSTS.includes(url.hostname);
  if (event.request.method !== 'GET' || !ours) return; // anything else: the browser handles it normally

  // Our own files: always ask the server if they changed ("no-cache"), so an update shows on the next visit.
  // (Without this, the browser's short-term memory could still hand back the old file.)
  const fresh = url.origin === location.origin ? { cache: 'no-cache' } : {};

  event.respondWith(
    fetch(event.request, fresh)
      .then(response => {
        // Save a copy. "opaque" = a font file the browser may not read, but may store.
        if (response.ok || response.type === 'opaque') {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      // Offline: use the saved copy (ignoreSearch: "app.html?x" still finds "app.html")
      .catch(() => caches.match(event.request, { ignoreSearch: true })
        .then(saved => saved || Response.error()))
  );
});
