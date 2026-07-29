import api from "./api";

// A travel agency's own tour packages + bookings (live backend).
export const listMyPackages = async () => (await api.get("/agency/packages")).data;
export const createMyPackage = async (b) => (await api.post("/agency/packages", b)).data.package;
export const updateMyPackage = async (id, b) => (await api.put(`/agency/packages/${id}`, b)).data.package;
export const deleteMyPackage = async (id) => (await api.delete(`/agency/packages/${id}`)).data;
export const listMyTourBookings = async () => (await api.get("/agency/bookings")).data.bookings;
