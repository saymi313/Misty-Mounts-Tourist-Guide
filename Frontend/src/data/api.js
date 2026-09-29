import axios from "axios";

// Live-backend config. When VITE_API_URL is set (see .env), the app talks to the
// real Express API + Socket.io; otherwise it stays on the dummy-data layer.
export const API_URL = import.meta.env.VITE_API_URL || "";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";
export const LIVE = Boolean(API_URL);

const api = axios.create({ baseURL: API_URL });
export const sessionToken = (url = '') => {
  const admin = window.location.pathname.startsWith('/admin') || url.startsWith('/admin');
  return admin ? localStorage.getItem('adminToken') || localStorage.getItem('token')
    : localStorage.getItem('token') || localStorage.getItem('adminToken');
};

// Attach the JWT — admin routes use the admin token, everything else the user token.
api.interceptors.request.use((config) => {
  const token = sessionToken(config.url);
  // Don't clobber a token the caller set explicitly (e.g. image uploads).
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
