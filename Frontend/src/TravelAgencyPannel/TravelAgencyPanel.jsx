import React from "react";
import { Routes } from "react-router-dom";
import TravelAgencyRoutes from "./routes/TravelAgencyRoutes";

/**
 * Travel-agency panel. Each page supplies its own shell (TravelAgencyLayout),
 * so this is just the route host — mirrors HotelPanel / LocalGuidePanel.
 */
const TravelAgencyPanel = () => <Routes>{TravelAgencyRoutes()}</Routes>;

export default TravelAgencyPanel;
