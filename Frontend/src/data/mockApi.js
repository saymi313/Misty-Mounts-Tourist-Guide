// ─────────────────────────────────────────────────────────────────────────────
// Misty Mounts — Data API
//
// When VITE_API_URL is configured (see api.js / .env) each function calls the
// real Express backend; otherwise it resolves the SAME shape from the dummy-data
// layer after a short delay. Callers are unchanged either way.
// ─────────────────────────────────────────────────────────────────────────────
import api, { LIVE } from "./api";
import {
  cities,
  spotsByCity,
  allSpots,
  accommodations,
  transportationBySpot,
  feedbacks,
  disasters,
  weatherBySpot,
  bookings,
  scheduleItems,
} from "./mockData";

const delay = (ms = 350) => new Promise((res) => setTimeout(res, ms));

/** GET /api/admin/cities → string[] */
export async function getCities() {
  if (LIVE) return (await api.get("/admin/cities")).data;
  await delay();
  return [...cities];
}

/** GET /api/admin/spots/:city → { city, heroImage, tagline, nearbyPlaces } */
export async function getSpotsByCity(city) {
  if (LIVE) return (await api.get(`/admin/spots/${encodeURIComponent(city)}`)).data;
  await delay();
  return spotsByCity[city] || { city, nearbyPlaces: [] };
}

/** GET /api/admin/spots → [{ city, nearbyPlaces }] */
export async function getAllSpots() {
  if (LIVE) return (await api.get("/admin/spots")).data;
  await delay();
  return allSpots;
}

/** GET /api/admin/accommodations → Accommodation[] */
export async function getAccommodations() {
  if (LIVE) return (await api.get("/admin/accommodations")).data;
  await delay();
  return accommodations;
}

/** GET /api/admin/accommodations/:id → Accommodation */
export async function getAccommodationById(id) {
  if (LIVE) return (await api.get(`/admin/accommodations/${id}`)).data;
  await delay();
  const found = accommodations.find((a) => a._id === id);
  if (!found) throw new Error("Accommodation not found");
  return found;
}

/** GET /api/admin/transportation/:spotId → Transport[] */
export async function getTransportation(spotId) {
  if (LIVE) return (await api.get(`/admin/transportation/${encodeURIComponent(spotId || "default")}`)).data;
  await delay();
  return transportationBySpot.default;
}

/** GET /api/feedback → { feedbacks } */
export async function getFeedbacks() {
  if (LIVE) return (await api.get("/feedback")).data;
  await delay();
  return { feedbacks };
}

/** POST /api/feedback/submit → axios response (UI checks .status === 201) */
export async function submitFeedback(payload) {
  if (LIVE) return await api.post("/feedback/submit", payload);
  await delay(500);
  return { status: 201, data: { ...payload, _id: `fb-${Date.now()}` } };
}

/** GET /api/natural-disaster/get-disaster → { data } */
export async function getDisasters() {
  if (LIVE) return (await api.get("/natural-disaster/get-disaster")).data;
  await delay();
  return { data: disasters };
}

/** Weather — no backend endpoint yet; served from the mock either way. */
export async function getWeather(/* spotId */) {
  await delay(200);
  return weatherBySpot.default;
}

/** POST /api/payment/create → axios response (UI reads res.data.bookingId) */
export async function createPayment(payload) {
  if (LIVE) return await api.post("/payment/create", payload);
  await delay(700);
  return {
    data: {
      success: true,
      bookingId: `MM-${Math.floor(100000 + (payload?.numberOfDays || 1) * 137)}`,
      ...payload,
    },
  };
}

/** Admin dashboard: bookings / payments (dashboard stays on mock for now). */
export async function getBookings() {
  await delay();
  return bookings;
}

/** Right-rail schedule (mock). */
export async function getSchedule() {
  await delay();
  return scheduleItems;
}

export default {
  getCities,
  getSpotsByCity,
  getAllSpots,
  getAccommodations,
  getAccommodationById,
  getTransportation,
  getFeedbacks,
  submitFeedback,
  getDisasters,
  getWeather,
  createPayment,
  getBookings,
  getSchedule,
};
