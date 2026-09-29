import api from "./api";

// 1:1 messaging between a traveller and a local guide (live backend).
export const getConversations = async () =>
  (await api.get("/messages/conversations")).data.conversations;

export const getThread = async (partnerId, params = {}) =>
  (await api.get(`/messages/with/${partnerId}`, { params })).data;

export const sendMessage = async (partnerId, text) =>
  (await api.post(`/messages/with/${partnerId}`, { text })).data.message;

export const getUnreadMessageCount = async () =>
  (await api.get("/messages/unread-count")).data.count;
