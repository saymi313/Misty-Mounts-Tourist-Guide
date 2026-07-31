/**
 * Unified wishlist — a client-side "save for later" across every content type
 * (spot, guide, hotel, tour). localStorage-backed with an event bus so any
 * heart button / the Wishlist page stay in sync.
 *
 * Item shape: { type, id, title, image, city, price, href, meta }
 */
const KEY = "mm_wishlist";
const EVENT = "mm-wishlist-changed";
let cache = null;

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
const write = (items) => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
};
const notify = () => window.dispatchEvent(new CustomEvent(EVENT));
const same = (a, type, id) => a.type === type && String(a.id) === String(id);

export const getWishlist = () => {
  if (cache === null) cache = read();
  return cache;
};

export const isWished = (type, id) => getWishlist().some((x) => same(x, type, id));

/** Toggle an item; returns true if it's now saved. */
export const toggleWish = (item) => {
  const list = getWishlist();
  const exists = list.some((x) => same(x, item.type, item.id));
  cache = exists
    ? list.filter((x) => !same(x, item.type, item.id))
    : [{ ...item, addedAt: Date.now() }, ...list];
  write(cache);
  notify();
  return !exists;
};

export const removeWish = (type, id) => {
  cache = getWishlist().filter((x) => !same(x, type, id));
  write(cache);
  notify();
};

export const subscribeWishlist = (cb) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
