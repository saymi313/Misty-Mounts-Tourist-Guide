import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import TouristSpotManagement from "../pages/TouristSpotManagement";
import AccommodationManagement from "../pages/AccommodationManagement";
import TransportManagement from "../pages/TransportManagement";
import PaymentsManagement from "../pages/PaymentManagement";
const AdminRoutes = () => {
  const isAuthenticated = !!localStorage.getItem("adminToken"); // Check if token exists

  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/dashboard"
        element={
          isAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />
        }
      />
      <Route
        path="/admin/tourist-spots"
        element={
          isAuthenticated ? (
            <TouristSpotManagement />
          ) : (
            <Navigate to="/admin/login" />
          )
        }
      />
      <Route
        path="/admin/accommodation"
        element={
          isAuthenticated ? (
            <AccommodationManagement />
          ) : (
            <Navigate to="/admin/login" />
          )
        }
      />
      <Route
        path="/admin/transportation"
        element={
          isAuthenticated ? (
            <TransportManagement />
          ) : (
            <Navigate to="/admin/login" />
          )
        }
      />
      <Route
        path="/admin/payments"
        element={
          isAuthenticated ? (
            <PaymentsManagement />
          ) : (
            <Navigate to="/admin/login" />
          )
        }
      />

      {/* Redirect unmatched paths to login */}
      <Route path="*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
};

export default AdminRoutes;
