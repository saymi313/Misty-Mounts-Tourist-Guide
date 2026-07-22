// Admin/guide dashboard API calls (only used when LIVE). The axios interceptor
// attaches the admin token for /admin/* routes and the user token otherwise.
import api, { LIVE } from "./api";

export { LIVE };

// ── Accommodations ────────────────────────────────────────────────────────────
export const listAccommodations = async () => (await api.get("/admin/accommodations")).data;
export const createAccommodation = async (b) => (await api.post("/admin/accommodations", b)).data.accommodation;
export const updateAccommodation = async (id, b) => (await api.put(`/admin/accommodations/${id}`, b)).data.accommodation;
export const deleteAccommodation = async (id) => (await api.delete(`/admin/accommodations/${id}`)).data;

// ── Transportation ────────────────────────────────────────────────────────────
export const listTransportation = async () => (await api.get("/admin/transportation")).data;
export const createTransportation = async (b) => (await api.post("/admin/transportation", b)).data.transportation;
export const updateTransportation = async (id, b) => (await api.put(`/admin/transportation/${id}`, b)).data.updatedTransport;
export const deleteTransportation = async (id) => (await api.delete(`/admin/transportation/${id}`)).data;

// ── Places (flat spots) ───────────────────────────────────────────────────────
export const listPlaces = async () => (await api.get("/admin/places")).data.places;
export const createPlace = async (b) => (await api.post("/admin/places", b)).data.place;
export const updatePlace = async (id, b) => (await api.put(`/admin/places/${id}`, b)).data.place;
export const deletePlace = async (id) => (await api.delete(`/admin/places/${id}`)).data;

// ── Payments / bookings (admin) ───────────────────────────────────────────────
export const listPayments = async () => (await api.get("/payment")).data.payments;
export const updatePaymentStatus = async (bookingId, status) =>
  (await api.put("/payment/approve", { bookingId, status })).data;

// ── Natural-disaster alerts ───────────────────────────────────────────────────
export const listDisasters = async () => (await api.get("/natural-disaster/get-disaster")).data.data;
export const createDisaster = async (b) => (await api.post("/natural-disaster/add-disaster", b)).data.data;
export const updateDisaster = async (id, b) => (await api.put(`/natural-disaster/${id}`, b)).data.data;
export const deleteDisaster = async (id) => (await api.delete(`/natural-disaster/${id}`)).data;
