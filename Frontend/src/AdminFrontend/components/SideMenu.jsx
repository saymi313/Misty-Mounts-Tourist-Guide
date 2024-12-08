// SideMenu.js
import React from "react";
import { useState } from "react";

const SideMenu = ({ NavOpen, IsNavOpen, goToAdminDashboard, goToAccommodationManagement, goToTouristSpotManagement, goToTransportManagement,goToPaymentManagement }) => {
  return (
    <div
      className={`sideMenu bg-white transition-all duration-500 ease-in-out h-screen md:h-[600px] gap-12 pl-4 rounded-br-lg shadow-md flex-col fixed z-10 sm:flex ${
        NavOpen ? "w-[200px] top-0 left-0" : "w-[78px] -left-52 sm:left-0"
      }`}
    >
      <div className="flex pl-2.5 pt-8 px-5 justify-between items-center z-50">
        <a href="#_">
          <img src="/mountain.png" alt="logo"/>
        </a>
      </div>
      <div className="flex flex-col items-start gap-5 justify-between pr-5  h-full mt-5 md:mt-0">
        <div className="flex flex-col gap-6 h-full">
          <button
            onClick={goToAdminDashboard}
            className={`flex gap-3 items-center ${NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""}`}
          >
            <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
              <img className="h-8 w-8" src="/home.png" alt="logo" />
            </div>
            <span className={`${NavOpen ? "block delay-700 delayed-text" : "hidden"}`}>Home</span>
          </button>
          <button
            onClick={goToAccommodationManagement}
            className={`flex gap-3 items-center ${NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""}`}
          >
            <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
              <img className="h-8 w-8" src="/accomodation.png" alt="logo" />
            </div>
            <span className={`${NavOpen ? "block delay-700 delayed-text" : "hidden"}`}>Accommodation</span>
          </button>
          <button
            onClick={goToTouristSpotManagement}
            className={`flex gap-3 items-center ${NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""}`}
          >
            <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
              <img className="h-8 w-8" src="/landmark.png" alt="logo" />
            </div>
            <span className={`${NavOpen ? "block delay-700 delayed-text" : "hidden"}`}>Tourist Spot</span>
          </button>
          <button
            onClick={goToTransportManagement}
            className={`flex gap-3 items-center ${NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""}`}
          >
            <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
              <img className="h-8 w-8" src="/delivery.png" alt="logo" />
            </div>
            <span className={`${NavOpen ? "block delay-700 delayed-text" : "hidden"}`}>Transport</span>
          </button>
          <button
            onClick={goToPaymentManagement}
            className={`flex gap-3 items-center ${NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""}`}
          >
            <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
              <img className="h-8 w-8" src="/income.png" alt="logo" />
            </div>
            <span className={`${NavOpen ? "block delay-700 delayed-text" : "hidden"}`}>Payments</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
