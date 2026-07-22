import axios from "axios";

// Live-backend config. When VITE_API_URL is set (see .env), the app talks to the
// real Express API + Socket.io; otherwise it stays on the dummy-data layer.
export const API_URL = import.meta.env.VITE_API_URL || "";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";
export const LIVE = Boolean(API_URL);

const api = axios.create({ baseURL: API_URL });

// Attach the JWT — admin routes use the admin token, everything else the user token.
api.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAdmin = url.startsWith("/admin") || url.includes("/admin/");
  // Admin routes prefer the admin token; shared routes (e.g. /notifications) use
  // the user token, falling back to the admin token so the admin panel stays
  // authenticated on endpoints it shares with travellers and guides.
  const token = isAdmin
    ? localStorage.getItem("adminToken") || localStorage.getItem("token")
    : localStorage.getItem("token") || localStorage.getItem("adminToken");
  // Don't clobber a token the caller set explicitly (e.g. image uploads).
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
