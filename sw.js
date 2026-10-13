/* Offline cache. Bump VERSION whenever you change any file so phones pick up the update. */
const VERSION = 'mahjong-school-v15';
const FILES = [
  './', 'index.html', 'css/style.css', 'js/tiles.js', 'js/content.js', 'js/drills.js', 'js/card.js', 'js/steps.js', 'js/ask.js', 'js/helper.js', 'js/app.js',
  'manifest.webmanifest', 'icon.svg', 'install.html', 'privacy.html',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Network first, fall back to cache, so updates show up right away when online. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
