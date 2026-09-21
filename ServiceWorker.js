const cacheName = "Team 6515-Word Online Client-1.1.0";
const contentToCache = [
  "Build/bb0d9ecdb05db3e84da20bd14a4f84dc.loader.js",
  "Build/41d17697aafcef43d22ecf4522875179.framework.js",
  "Build/ca668328a1d82a0b0f069ee59d5427c4.data",
  "Build/7c268daa29d0f2702f591da584b35009.wasm",
  "TemplateData/style.css"
];

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(contentToCache.map(p => new Request(p, { cache: 'reload' })));
  })());
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  
  if (e.request.url.endsWith("index.html")) {
        e.respondWith(fetch(e.request));
    }
  
  const req = e.request;
  if (req.method !== 'GET') return;
  
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  const isUnityResource = url.pathname.includes('/Build/') ||
      url.pathname.includes('/TemplateData/') ||
      /\.(js|css|wasm|data|unityweb)$/i.test(url.pathname);

  const isStaticAsset =
    sameOrigin && /\.(js|css|wasm|data|png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname);

  if (sameOrigin && (isUnityResource || isStaticAsset)) {

    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const resp = await fetch(req);
        if (resp.ok && resp.type !== 'opaque') {
          const cache = await caches.open(cacheName);
          await cache.put(req, resp.clone());
        }
        return resp;
      } catch (err) {
        return new Response('', {status: 504, statusText: 'Gateway Timeout'});
      }
    })());
  }
});
