import api from "./api";

// Public tour packages + traveller booking (live backend).
export const listTours = async (params = {}) => {
  const qs = new URLSearchParams();
  if (params.city && params.city !== "all") qs.set("city", params.city);
  if (params.q) qs.set("q", params.q);
  const suffix = qs.toString() ? `?${qs}` : "";
  return (await api.get(`/tours${suffix}`)).data.tours;
};
export const getTour = async (id) => (await api.get(`/tours/${id}`)).data.tour;
export const bookTour = async (payload) => (await api.post("/tours/book", payload)).data;
export const listMyTourBookings = async () => (await api.get("/tours/my-bookings")).data.bookings;
