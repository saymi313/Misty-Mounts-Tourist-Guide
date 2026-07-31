/* Misty Mounts service worker — installable PWA + offline app shell.
 * Stale-while-revalidate for same-origin GETs only; never touches the API
 * (different origin), map tiles or fonts (cross-origin). */
const CACHE = "mm-cache-v1";
const SHELL = ["/", "/index.html", "/Logo.png", "/main logo.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // skip API / tiles / fonts

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => { if (res && res.ok) cache.put(request, res.clone()); return res; })
        .catch(() => cached);
      // For navigations, fall back to the cached shell when offline.
      if (request.mode === "navigate") return network.catch(() => cache.match("/index.html"));
      return cached || network;
    })
  );
});
