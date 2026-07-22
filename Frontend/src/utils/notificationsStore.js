/**
 * Notifications store, shared by the navbar bell and the /notifications page.
 * Sync reads from an in-memory cache (mirrored to localStorage) with a window
 * event for live cross-component updates; hydrates + write-throughs to the API
 * when the backend is live.
 */
import api, { LIVE } from "../data/api";

const KEY = "mm_notifications";
const EVENT = "mm-notifications-changed";
let cache = null;

const readLocal = () => {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
const persist = () => {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVENT));
};

export const getNotifications = () => {
  if (cache === null) cache = readLocal();
  return cache;
};

export const unreadCountOf = (list) => list.filter((n) => !n.read).length;

export const subscribeNotifications = (cb) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

/** Load from the API (live only). */
export const fetchNotifications = async () => {
  if (!LIVE) return getNotifications();
  try {
    const { data } = await api.get("/notifications");
    cache = data.notifications || [];
    persist();
  } catch { /* keep cache */ }
  return getNotifications();
};

export const markRead = (id) => {
  cache = getNotifications().map((n) => (n._id === id ? { ...n, read: true } : n));
  persist();
  if (LIVE) api.patch(`/notifications/${id}/read`).catch(() => {});
};

export const markAllRead = () => {
  cache = getNotifications().map((n) => ({ ...n, read: true }));
  persist();
  if (LIVE) api.patch("/notifications/read-all").catch(() => {});
};

export const removeNotification = (id) => {
  cache = getNotifications().filter((n) => n._id !== id);
  persist();
  if (LIVE) api.delete(`/notifications/${id}`).catch(() => {});
};

// Back-compat for any caller that set the whole list directly.
export const saveNotifications = (list) => {
  cache = list;
  persist();
};
