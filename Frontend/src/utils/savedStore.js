/**
 * Saved-spots store. Sync reads come from an in-memory cache (mirrored to
 * localStorage); when the backend is live it hydrates from the API and
 * write-throughs each toggle. Falls back to localStorage-only in dummy mode.
 */
import api, { LIVE } from "../data/api";

const KEY = "mm_saved_spots";
const EVENT = "mm-saved-changed";
let cache = null;

const readLocal = () => {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
const writeLocal = (ids) => {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* ignore */ }
};
const notify = () => window.dispatchEvent(new CustomEvent(EVENT));

export const getSaved = () => {
  if (cache === null) cache = readLocal();
  return cache;
};

export const setSaved = (ids) => {
  cache = ids;
  writeLocal(ids);
  notify();
};

export const isSaved = (id) => getSaved().includes(id);

/** Toggle saved state (optimistic); write-through to the API when live. */
export const toggleSaved = (id) => {
  const has = getSaved().includes(id);
  const next = has ? getSaved().filter((x) => x !== id) : [...getSaved(), id];
  setSaved(next);
  if (LIVE) {
    const req = has ? api.delete(`/user/saved/${encodeURIComponent(id)}`) : api.post(`/user/saved/${encodeURIComponent(id)}`);
    req.catch(() => {});
  }
  return next.includes(id);
};

/** Load the authoritative list from the API (live only). */
export const hydrateSaved = async () => {
  if (!LIVE) return getSaved();
  try {
    const { data } = await api.get("/user/saved");
    cache = data.savedSpots || [];
    writeLocal(cache);
    notify();
  } catch { /* keep cache */ }
  return getSaved();
};

export const subscribeSaved = (cb) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
