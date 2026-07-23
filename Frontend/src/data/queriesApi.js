import api from "./api";

// Contact-form messages ("Queries"). createQuery is public; the rest are admin.
export const createQuery = async (b) => (await api.post("/queries", b)).data;
export const listQueries = async () => (await api.get("/queries")).data.queries;
export const markQueryRead = async (id, isRead = true) =>
  (await api.patch(`/queries/${id}/read`, { isRead })).data.query;
export const deleteQuery = async (id) => (await api.delete(`/queries/${id}`)).data;
