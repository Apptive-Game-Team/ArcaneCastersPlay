const cacheName = "Team 6515-Arcane Casters-1.3.0";
const contentToCache = [
  "Build/bb0d9ecdb05db3e84da20bd14a4f84dc.loader.js",
  "Build/b14d16086a34849af17d83d47b4f652c.framework.js",
  "Build/ffb44fa38a87b5880fa9300318f27883.data",
  "Build/abc54d571223e5eba097dbbad82b3404.wasm",
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
