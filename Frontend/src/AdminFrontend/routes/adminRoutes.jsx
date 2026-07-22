import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import TouristSpotManagement from "../pages/TouristSpotManagement";
import AccommodationManagement from "../pages/AccommodationManagement";
import TransportManagement from "../pages/TransportManagement";
import PaymentsManagement from "../pages/PaymentManagement";
import UserManagement from "../pages/UserManagement";
import AdminSettings from "../pages/Settings";

/**
 * Validate the admin session token — a real, unexpired admin JWT, not just any
 * string in localStorage. (Server routes are the real guard; this stops the
 * dashboard shell rendering for a missing / stale / non-admin token.)
 */
const isAdminAuthed = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) return false;
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64));
    if (payload.type !== "admin") return false;
    if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
};

const RequireAdmin = ({ children }) =>
  isAdminAuthed() ? children : <Navigate to="/admin/login" replace />;

const AdminRoutes = () => (
  <Routes>
    <Route path="login" element={<Login />} />
    <Route path="dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
    <Route path="tourist-spots" element={<RequireAdmin><TouristSpotManagement /></RequireAdmin>} />
    <Route path="accommodation" element={<RequireAdmin><AccommodationManagement /></RequireAdmin>} />
    <Route path="transportation" element={<RequireAdmin><TransportManagement /></RequireAdmin>} />
    <Route path="payments" element={<RequireAdmin><PaymentsManagement /></RequireAdmin>} />
    <Route path="users" element={<RequireAdmin><UserManagement /></RequireAdmin>} />
    <Route path="settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
    {/* Unmatched admin paths → login */}
    <Route path="*" element={<Navigate to="/admin/login" replace />} />
  </Routes>
);

export default AdminRoutes;
