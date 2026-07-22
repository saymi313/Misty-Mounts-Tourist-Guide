import api from "./api";

// Local-guide directory + guide reviews (live backend).
export const listGuides = async () => (await api.get("/user/guides")).data.guides;
export const getGuide = async (id) => (await api.get(`/user/guides/${id}`)).data.guide;
export const getGuideFeedbacks = async (id) => (await api.get(`/feedback/guide/${id}`)).data.feedbacks;
export const submitGuideFeedback = async (id, body) =>
  (await api.post(`/feedback/guide/${id}`, body)).data.feedback;
