// Service worker du Pourquoi : garde l'app en cache pour qu'elle s'ouvre vite, et
// propose la nouvelle version quand une mise à jour est publiée.
// Changez VERSION à chaque déploiement pour déclencher la mise à jour chez les gens.
const VERSION = 'lp-2026-11-27-portrait';
const FICHIERS = ['/', '/index.html', '/app.css', '/app.js', '/config.js', '/holdingai.js', '/compte.js', '/demo.js', '/emma.webp', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSION).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'activer') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // Supabase, polices : réseau direct
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
