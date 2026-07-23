import React from "react";
import { Route } from "react-router-dom";
import HotelDashboard from "../pages/HotelDashboard";
import HotelListings from "../pages/HotelListings";
import HotelBookings from "../pages/HotelBookings";
import HotelRevenue from "../pages/HotelRevenue";
import HotelProfile from "../pages/HotelProfile";

// Paths are relative — mounted under /hotel/* in App.jsx.
const HotelRoutes = () => [
  <Route key="dashboard" index element={<HotelDashboard />} />,
  <Route key="listings" path="listings" element={<HotelListings />} />,
  <Route key="bookings" path="bookings" element={<HotelBookings />} />,
  <Route key="revenue" path="revenue" element={<HotelRevenue />} />,
  <Route key="profile" path="profile" element={<HotelProfile />} />,
];

export default HotelRoutes;
