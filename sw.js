const C = 'sheghlana-v2';
const FILES = ['./', 'index.html', 'style.css', 'logic.js', 'i18n.js', 'app.js', 'icon.svg', 'manifest.webmanifest', 'assets/yk-logo.svg', 'assets/favicon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
/* Only remove this app's own old caches: GitHub Pages user sites share one origin across repos. */
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('sheghlana-') && k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request)));
});
