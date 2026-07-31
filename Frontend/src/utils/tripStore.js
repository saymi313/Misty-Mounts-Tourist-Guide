/**
 * Trip Builder store — a client-side, multi-item "trip" the traveller assembles
 * from spots/guides/hotels/tours, groups by day, and shares. localStorage-backed
 * with an event bus. Item shape: { type, id, title, image, city, price, href, day }
 */
const KEY = "mm_trip";
const EVENT = "mm-trip-changed";
let cache = null;

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
const write = (items) => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
};
const notify = () => window.dispatchEvent(new CustomEvent(EVENT));
const same = (a, type, id) => a.type === type && String(a.id) === String(id);

export const getTrip = () => {
  if (cache === null) cache = read();
  return cache;
};

export const isInTrip = (type, id) => getTrip().some((x) => same(x, type, id));

/** Toggle an item in/out of the trip; returns true if it's now in the trip. */
export const toggleTrip = (item) => {
  const list = getTrip();
  const exists = list.some((x) => same(x, item.type, item.id));
  cache = exists
    ? list.filter((x) => !same(x, item.type, item.id))
    : [...list, { ...item, day: item.day ?? 0, addedAt: Date.now() }];
  write(cache);
  notify();
  return !exists;
};

export const removeFromTrip = (type, id) => {
  cache = getTrip().filter((x) => !same(x, type, id));
  write(cache);
  notify();
};

export const setDay = (type, id, day) => {
  cache = getTrip().map((x) => (same(x, type, id) ? { ...x, day: Number(day) || 0 } : x));
  write(cache);
  notify();
};

export const clearTrip = () => { cache = []; write(cache); notify(); };

/** Replace the whole trip (used when importing a shared plan). */
export const setTrip = (items) => { cache = Array.isArray(items) ? items : []; write(cache); notify(); };

export const subscribeTrip = (cb) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
