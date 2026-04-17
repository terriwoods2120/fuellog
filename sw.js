// FuelLog Service Worker — offline support
const CACHE = 'fuellog-v1';
const ASSETS = [
  '/fuellog/',
  '/fuellog/index.html',
  '/fuellog/fl-app.css',
  '/fuellog/fl-core.js',
  '/fuellog/fl-home.js',
  '/fuellog/fl-fuel.js',
  '/fuellog/fl-purchases.js',
  '/fuellog/fl-fleet.js',
  '/fuellog/fl-reports.js',
  '/fuellog/fl-utils.js',
  '/fuellog/fl-checklist.js',
  '/fuellog/fl-firebase.js',
  '/fuellog/icon-192.png',
  '/fuellog/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for Firebase, cache first for app files
  if(e.request.url.includes('firebaseio.com') || e.request.url.includes('googleapis.com')) {
    return; // Let Firebase requests go through normally
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('/fuellog/index.html'))
  );
});
