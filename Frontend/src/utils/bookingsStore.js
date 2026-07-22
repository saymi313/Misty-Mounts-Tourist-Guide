/**
 * Bookings store. Sync reads from an in-memory cache (mirrored to localStorage);
 * fetches the user's real bookings from the API when live. `addBooking` is an
 * optimistic local insert (the server row is created by the payment call).
 */
import { myBookings } from "../data/mockData";
import api, { LIVE } from "../data/api";

const KEY = "mm_bookings";
let cache = null;

const readLocal = () => {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : myBookings.map((b) => ({ ...b }));
  } catch {
    return myBookings.map((b) => ({ ...b }));
  }
};
const writeLocal = (list) => {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
};

export const getBookings = () => {
  if (cache === null) cache = readLocal();
  return cache;
};

export const saveBookings = (list) => {
  cache = list;
  writeLocal(list);
};

/** Optimistic local insert after checkout. */
export const addBooking = (booking) => {
  const next = [booking, ...getBookings()];
  saveBookings(next);
  return next;
};

/** Load the user's bookings from the API (live only). */
export const fetchBookings = async () => {
  if (!LIVE) return getBookings();
  try {
    const { data } = await api.get("/payment/me");
    cache = data.bookings || [];
    writeLocal(cache);
  } catch { /* keep cache */ }
  return getBookings();
};

/** Cancel a booking on the server (live only). */
export const cancelBookingRemote = (id) => {
  if (LIVE) api.patch(`/payment/${id}/cancel`).catch(() => {});
};
