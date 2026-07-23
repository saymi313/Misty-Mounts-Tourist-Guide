import api from "./api";

// Hotel-manager panel API (owner-scoped; requires a signed-in hotel account).
export const listMyAccommodations = async () => (await api.get("/hotel/accommodations")).data;
export const createMyAccommodation = async (b) => (await api.post("/hotel/accommodations", b)).data.accommodation;
export const updateMyAccommodation = async (id, b) => (await api.put(`/hotel/accommodations/${id}`, b)).data.accommodation;
export const deleteMyAccommodation = async (id) => (await api.delete(`/hotel/accommodations/${id}`)).data;
export const listMyBookings = async () => (await api.get("/hotel/bookings")).data.bookings;
