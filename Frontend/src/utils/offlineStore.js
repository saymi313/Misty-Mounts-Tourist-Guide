/**
 * Offline Trip Pack — lets a traveller download their trip so it stays usable
 * with no signal (the norm on high passes in the north). It snapshots the trip
 * itinerary + city coordinates + regional safety info to localStorage, and
 * pre-warms two Cache Storage buckets the service worker serves offline:
 *   • mm-img-v1   — every item's photo (Cloudinary/cross-origin)
 *   • mm-tiles-v1 — OSM map tiles around each trip city, so the map renders offline
 *
 * The pack is self-contained: the /trip/offline viewer reads only from here and
 * never hits the network, so it works in airplane mode.
 */
import { CITY_COORDS } from "../data/geo";
import { CITY_REGION, REGION_SAFETY, EMERGENCY_NUMBERS } from "../data/safety";

const KEY = "mm_offline_pack";
const EVENT = "mm-offline-changed";
const IMG_CACHE = "mm-img-v1";
const TILE_CACHE = "mm-tiles-v1";

// Tile zoom levels to pre-cache per city, with the neighbour radius at each.
// z8 = regional context, z11 = valley, z13 = town detail. Kept small out of
// respect for OSM's tile policy (~19 tiles/city).
const TILE_PLAN = [
  { z: 8, r: 0 },
  { z: 11, r: 1 },
  { z: 13, r: 1 },
];

// Cached snapshot so getPack() returns a stable reference between changes
// (required by useSyncExternalStore — a fresh object each call would loop).
let cache;
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
const refresh = () => { cache = read(); };
const notify = () => { refresh(); window.dispatchEvent(new CustomEvent(EVENT)); };

export const getPack = () => {
  if (cache === undefined) cache = read();
  return cache;
};

export const subscribePack = (cb) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export const isOnline = () => (typeof navigator !== "undefined" ? navigator.onLine : true);

// ── tile math (Web Mercator → tile x/y) ──────────────────────────────────────
function latLonToTile(lat, lon, z) {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y, n };
}

function tileUrlsForCity([lat, lon]) {
  const urls = [];
  for (const { z, r } of TILE_PLAN) {
    const { x, y, n } = latLonToTile(lat, lon, z);
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const tx = ((x + dx) % n + n) % n;
        const ty = y + dy;
        if (ty < 0 || ty >= n) continue;
        // Normalised (subdomain-less) key — matches the service worker's tileKey().
        urls.push(`https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`);
      }
    }
  }
  return urls;
}

// Best-effort cache write; opaque (no-cors) responses are fine to store + serve.
async function warm(cacheName, url) {
  try {
    const cache = await caches.open(cacheName);
    if (await cache.match(url)) return true;
    const res = await fetch(url, { mode: "no-cors" });
    if (res && (res.ok || res.type === "opaque")) { await cache.put(url, res.clone()); return true; }
  } catch { /* offline / blocked — skip */ }
  return false;
}

/**
 * Build (or refresh) the offline pack from the current trip items.
 * @param {Array} items  trip items { type, id, title, image, city, price, href, day }
 * @param {(p:{done:number,total:number,label:string})=>void} [onProgress]
 */
export async function buildPack(items, onProgress = () => {}) {
  const list = Array.isArray(items) ? items : [];
  const cities = [...new Set(list.map((i) => i.city).filter(Boolean))];

  // Pre-warm the JS chunks the offline viewer needs (map + page) while we still
  // have signal, so the service worker caches them for the no-signal visit.
  import("../components/ExploreMap").catch(() => {});
  import("../UserPanel/pages/OfflineTrip").catch(() => {});

  // Snapshot each item with resolved coordinates for offline directions/map.
  const packItems = list.map((i) => ({
    type: i.type, id: i.id, title: i.title, image: i.image || "",
    city: i.city || "", price: Number(i.price) || 0, href: i.href || "",
    day: i.day || 0,
    coords: (i.city && CITY_COORDS[i.city]) || null,
  }));

  // Regional safety guidance for the regions this trip touches.
  const regions = [...new Set(cities.map((c) => CITY_REGION[c]).filter(Boolean))];
  const safety = regions.map((region) => ({ region, ...(REGION_SAFETY[region] || {}) }));

  // Assemble everything we'll pre-warm: item images + tiles for each city.
  const images = [...new Set(packItems.map((i) => i.image).filter((u) => /^https?:\/\//.test(u) || u.startsWith("/")))];
  const tiles = cities.flatMap((c) => (CITY_COORDS[c] ? tileUrlsForCity(CITY_COORDS[c]) : []));
  const total = images.length + tiles.length;
  let done = 0;

  const step = (label) => { done += 1; onProgress({ done, total, label }); };
  onProgress({ done: 0, total, label: "Preparing…" });

  // Images first (most visible), then map tiles.
  for (const url of images) { await warm(IMG_CACHE, url); step("Saving photos"); }
  for (const url of tiles) { await warm(TILE_CACHE, url); step("Saving map"); }

  const pack = {
    builtAt: Date.now(),
    itemCount: packItems.length,
    cities,
    items: packItems,
    safety,
    emergency: EMERGENCY_NUMBERS,
    tilesCached: tiles.length,
    imagesCached: images.length,
  };
  try { localStorage.setItem(KEY, JSON.stringify(pack)); } catch { /* quota */ }
  notify();
  return pack;
}

/** Remove the pack snapshot. The image/tile caches are shared with normal
 * browsing, so we leave them for the browser to evict under storage pressure
 * rather than wiping imagery the rest of the app benefits from. */
export async function removePack() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  notify();
}
