const CACHE = 'subkit-v7';
const SHELL = ['/', '/index.html', '/app.html', '/privacy', '/terms', '/changelog', '/og.svg', '/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/manifest.json'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(SHELL).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if(e.request.method !== 'GET') return;
  // Don't cache Supabase API, exchange rates, or EmailJS calls
  var url = e.request.url;
  if(url.includes('supabase.co') || url.includes('emailjs.com') || url.includes('open.er-api.com')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var network = fetch(e.request).then(function(response) {
        if(response.status === 200 && response.type !== 'opaque') {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      });
      // Cache-first for app shell, network-first for everything else
      var isShell = SHELL.some(function(s) { return url.endsWith(s); });
      return isShell ? (cached || network) : network.catch(function() { return cached; });
    })
  );
});
