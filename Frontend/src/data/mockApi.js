// ─────────────────────────────────────────────────────────────────────────────
// Misty Mounts — Mock API
//
// Stand-in for the disconnected backend. Each function resolves to the SAME
// shape the old Express endpoints returned, after a short simulated delay, so
// pages keep their loading states and data handling unchanged.
// ─────────────────────────────────────────────────────────────────────────────
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
  await delay();
  return [...cities];
}

/** GET /api/admin/spots/:city → { city, nearbyPlaces } */
export async function getSpotsByCity(city) {
  await delay();
  return spotsByCity[city] || { city, nearbyPlaces: [] };
}

/** GET /api/admin/spots → [{ city, nearbyPlaces }] */
export async function getAllSpots() {
  await delay();
  return allSpots;
}

/** GET /api/admin/accommodations → Accommodation[] */
export async function getAccommodations() {
  await delay();
  return accommodations;
}

/** GET /api/admin/accommodations/:id → Accommodation */
export async function getAccommodationById(id) {
  await delay();
  const found = accommodations.find((a) => a._id === id);
  if (!found) throw new Error("Accommodation not found");
  return found;
}

/** GET /api/admin/transportation/:spotId → Transport[] */
export async function getTransportation(/* spotId */) {
  await delay();
  return transportationBySpot.default;
}

/** GET /api/feedback → { feedbacks } */
export async function getFeedbacks() {
  await delay();
  return { feedbacks };
}

/** POST /api/feedback/submit → { status: 201 } (no-op, echoes success) */
export async function submitFeedback(payload) {
  await delay(500);
  return { status: 201, data: { ...payload, _id: `fb-${Date.now()}` } };
}

/** GET /api/natural-disaster/get-disaster → { data } */
export async function getDisasters() {
  await delay();
  return { data: disasters };
}

/** Weather (was hard-coded client-side) → OpenWeather-ish shape */
export async function getWeather(/* spotId */) {
  await delay(200);
  return weatherBySpot.default;
}

/** POST /api/payment/create → echoes a booking confirmation */
export async function createPayment(payload) {
  await delay(700);
  return {
    data: {
      success: true,
      bookingId: `MM-${Math.floor(100000 + (payload?.numberOfDays || 1) * 137)}`,
      ...payload,
    },
  };
}

/** Admin dashboard: bookings / payments */
export async function getBookings() {
  await delay();
  return bookings;
}

/** Right-rail schedule */
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
