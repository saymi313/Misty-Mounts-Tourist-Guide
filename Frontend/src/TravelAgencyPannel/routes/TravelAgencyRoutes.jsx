import React from "react";
import { Route } from "react-router-dom";
import AgencyDashboard from "../pages/AgencyDashboard";
import AgencyPackages from "../pages/AgencyPackages";
import AgencyBookings from "../pages/AgencyBookings";
import AgencyRevenue from "../pages/AgencyRevenue";
import AgencyProfile from "../pages/AgencyProfile";

// Paths are relative — mounted under /travel-agency/* in App.jsx.
const TravelAgencyRoutes = () => [
  <Route key="dashboard" index element={<AgencyDashboard />} />,
  <Route key="packages" path="packages" element={<AgencyPackages />} />,
  <Route key="bookings" path="bookings" element={<AgencyBookings />} />,
  <Route key="revenue" path="revenue" element={<AgencyRevenue />} />,
  <Route key="profile" path="profile" element={<AgencyProfile />} />,
];

export default TravelAgencyRoutes;
