const CACHE_NAME = 'ballab-masala-v2';
const STATIC_ASSETS = [
'./index.html',
'./about.html',
'./contact.html',
'./product.html',
'./privacy.html',
'./terms.html',
'./manifest.json'
];
self.addEventListener('install', (e) => {
e.waitUntil(
caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
);
self.skipWaiting();
});
self.addEventListener('activate', (e) => {
e.waitUntil(
caches.keys().then((keys) => {
return Promise.all(
keys.map((k) => {
if (k !== CACHE_NAME) return caches.delete(k);
})
);
})
);
self.clients.claim();
});
self.addEventListener('fetch', (e) => {
// Network-first for dynamic Google Sheet CSV data
if (e.request.url.includes('google.com/spreadsheets')) {
e.respondWith(
fetch(e.request)
.then((res) => {
const clone = res.clone();
caches.open('ballab-data').then((c) => c.put(e.request, clone));
return res;
})
.catch(() => caches.match(e.request))
);
} else {
// Cache-first for static pages & styles
e.respondWith(
caches.match(e.request).then((cached) => cached || fetch(e.request))
);
}
});
