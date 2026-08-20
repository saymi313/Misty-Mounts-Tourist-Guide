/* Misty Mounts service worker — installable PWA + offline app shell, tuned for
 * weak/slow connections (remote northern-Pakistan travel areas):
 *   • hashed build assets (/assets/*) → cache-first (immutable; never re-fetched)
 *   • Google Fonts → cache-first in a dedicated cache (downloaded once, ever)
 *   • navigations & other same-origin GETs → stale-while-revalidate + offline shell
 *   • API (different origin) & map tiles → passed straight to the network */
const CACHE = "mm-cache-v2";
const FONT_CACHE = "mm-fonts-v1";
const SHELL = ["/", "/index.html", "/Logo.png", "/main logo.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = [CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// ── Web-Push ────────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data && event.data.text() }; }
  const title = data.title || "Misty Mounts";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/Logo.png",
      badge: "/Logo.png",
      data: { link: data.link || "/notifications" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ("focus" in w) { w.navigate(link); return w.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(link);
    })
  );
});

// Cache-first: serve from cache and skip the network entirely once stored.
// Only safe for immutable resources (content-hashed assets, versioned fonts).
function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(async (cache) => {
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const res = await fetch(request);
      if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
      return res;
    } catch {
      return cached || Response.error();
    }
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Google Fonts (CSS + font files) — download once, then always from cache.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return; // skip API / map tiles

  // Vite emits content-hashed files under /assets/ — the URL changes whenever the
  // bytes change, so a cache hit is always current. Serve them without touching
  // the network to save every possible byte on weak links.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, CACHE));
    return;
  }

  // Everything else same-origin: stale-while-revalidate, shell fallback offline.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => { if (res && res.ok) cache.put(request, res.clone()); return res; })
        .catch(() => cached);
      if (request.mode === "navigate") return network.catch(() => cache.match("/index.html"));
      return cached || network;
    })
  );
});
