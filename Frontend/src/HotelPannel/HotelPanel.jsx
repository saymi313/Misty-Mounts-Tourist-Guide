import React from "react";
import { Routes } from "react-router-dom";
import HotelRoutes from "./routes/HotelRoutes";

/**
 * Hotel-manager panel. Each page supplies its own dashboard shell (HotelLayout),
 * so this is just the route host — mirrors LocalGuidePanel.
 */
const HotelPanel = () => {
  return <Routes>{HotelRoutes()}</Routes>;
};

export default HotelPanel;
