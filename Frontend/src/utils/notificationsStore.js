/**
 * Notifications store, shared by the navbar bell and the /notifications page.
 * Sync reads from an in-memory cache (mirrored to localStorage) with a window
 * event for live cross-component updates; hydrates + write-throughs to the API
 * when the backend is live.
 */
import api, { LIVE, sessionToken } from "../data/api";

const KEY = "mm_notifications";
const EVENT = "mm-notifications-changed";
let cache = null;
let loadedPage = 1;
let more = false;
export const hasMoreNotifications = () => more;
let session = null;
const currentSession = () => LIVE ? sessionToken('/notifications') : 'demo';
export const resetNotifications = () => {
  session = currentSession(); cache = []; loadedPage = 1; more = false;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
};

const readLocal = () => {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
const persist = () => {
  try {
    if (LIVE) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(cache));
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVENT));
};

export const getNotifications = () => {
  if (LIVE && session !== currentSession()) { session = currentSession(); cache = []; loadedPage = 1; more = false; }
  if (cache === null) cache = LIVE ? [] : readLocal();
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
  getNotifications();
  const requestedSession = currentSession();
  if (!requestedSession) return [];
  try {
    const { data } = await api.get("/notifications");
    if (requestedSession !== currentSession()) return getNotifications();
    cache = data.notifications || [];
    loadedPage = 1;
    more = Boolean(data.pagination?.hasMore);
    persist();
  } catch { /* keep cache */ }
  return getNotifications();
};

export const loadMoreNotifications = async () => {
  if (!LIVE || !more) return;
  const requestedSession = currentSession();
  const { data } = await api.get('/notifications', { params: { page: loadedPage + 1 } });
  if (requestedSession !== currentSession()) return;
  const ids = new Set(getNotifications().map((item) => item._id));
  cache = [...getNotifications(), ...data.notifications.filter((item) => !ids.has(item._id))];
  loadedPage += 1;
  more = Boolean(data.pagination?.hasMore);
  persist();
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
