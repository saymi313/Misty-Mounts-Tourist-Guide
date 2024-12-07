// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import AccommodationForm from "../components/AccommodationForm"; // Assuming this form handles adding and updating accommodations

// const AccommodationManagement = () => {

//   return (

//   );
// };

// export default AccommodationManagement;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import axios from "axios";
import AccommodationForm from "../components/AccommodationForm";
const AccommodationManagement = () => {
  const [NavOpen, IsNavOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false); // State to toggle form visibility
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true); // Initially set loading to true
  const [selectedAccommodation, setSelectedAccommodation] = useState(null); // For updating an accommodation
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };
  // Fetch all accommodations
  const fetchAccommodations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/accommodations"
      );
      setAccommodations(response.data);
      setLoading(false); // Set loading to false when data is fetched
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []); // Fetch accommodations on component mount

  // Handle adding a new accommodation
  // Handle adding a new accommodation
  const handleAddAccommodation = async (newAccommodation) => {
    try {
      await axios.post(
        "http://localhost:5000/api/admin/accommodations",
        newAccommodation
      );
      fetchAccommodations(); // Refresh the accommodations after adding
    } catch (error) {
      console.error("Error adding accommodation:", error);
    }
  };

  // Handle updating an accommodation
  const handleUpdateAccommodation = async (updatedAccommodation) => {
    if (!selectedAccommodation) return;
    try {
      await axios.put(
        `http://localhost:5000/api/admin/accommodations/${selectedAccommodation._id}`,
        updatedAccommodation
      );
      fetchAccommodations(); // Refresh the accommodations after updating
      setSelectedAccommodation(null); // Reset the selected accommodation after update
    } catch (error) {
      console.error("Error updating accommodation:", error);
    }
  };

  // Handle deleting an accommodation
  const handleDeleteAccommodation = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/accommodations/${id}`
      );
      fetchAccommodations(); // Refresh the accommodations after deletion
    } catch (error) {
      console.error("Error deleting accommodation:", error);
    }
  };

  // Handle selecting an accommodation for update
  const handleSelectAccommodationForUpdate = (accommodation) => {
    setSelectedAccommodation(accommodation); // Set the selected accommodation to be updated
  };

  // Function to navigate to Tourist Spot Management
  const goToTouristSpotManagement = () => {
    navigate("/admin/tourist-spots"); // Navigating to the tourist spots management page
  };

  const goToAccommodationManagement = () => {
    navigate("/admin/accommodation"); // Navigating to the tourist spots management page
  };
  const goToAdminDashboard = () => {
    navigate("/admin/dashboard"); // Navigating to the tourist spots management page
  };
  const goToTransportManagement = () => {
    navigate("/admin/transportation"); // Navigating to the tourist spots management page
  };
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div className="flex">
      <div
        className={`bg-white transition-all duration-500 ease-in-out h-screen md:h-[600px] gap-12 pl-4 rounded-br-lg shadow-md flex-col fixed z-10 sm:flex ${
          NavOpen ? "w-[200px] top-0 left-0" : "w-[78px] -left-52 sm:left-0"
        } `}
      >
        <div className="flex pl-2.5 pt-8 px-5 justify-between items-center">
          <a href="#_">
            <img src="/mountain.png" alt="logo" />
          </a>
        </div>
        <div className="flex flex-col items-start gap-14 justify-between pr-5 py-5 h-full mt-5 md:mt-0">
          <div className="flex flex-col gap-10 h-full">
            <button
              onClick={goToAdminDashboard}
              className={`flex gap-3 items-center ${
                NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""
              }`}
            >
              <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
                <img className="h-8 w-8" src="/home.png" alt="logo" />
              </div>
              <span
                className={` ${
                  NavOpen ? "block delay-700 delayed-text" : "hidden"
                }`}
              >
                Home
              </span>
            </button>
            <button
              onClick={goToAccommodationManagement}
              className={`flex gap-3 items-center ${
                NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""
              }`}
            >
              <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
                <img className="h-8 w-8" src="/accomodation.png" alt="logo" />
              </div>
              <span
                className={` ${
                  NavOpen ? "block delay-700 delayed-text" : "hidden"
                }`}
              >
                Accomodation
              </span>
            </button>
            <button
              onClick={goToTouristSpotManagement}
              className={`flex gap-3 items-center ${
                NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""
              }`}
            >
              <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
                <img className="h-8 w-8" src="/landmark.png" alt="logo" />
              </div>
              <span
                className={` ${
                  NavOpen ? "block delay-700 delayed-text" : "hidden"
                }`}
              >
                Tourist Spot
              </span>
            </button>
            <button
              onClick={goToTransportManagement}
              className={`flex gap-3 items-center ${
                NavOpen ? "hover:bg-[#D8FFFF] px-1 rounded-sm" : ""
              }`}
            >
              <div className="hover:bg-[#D8FFFF] transition-colors duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-sm">
                <img className="h-8 w-8" src="/delivery.png" alt="logo" />
              </div>
              <span
                className={` ${
                  NavOpen ? "block delay-700 delayed-text" : "hidden"
                }`}
              >
                Transport
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col md:ml-20">
        <div className="px-5 md:px-10 py-5 bg-white flex items-center justify-between w-full fixed z-20">
          <div className="hidden sm:block z-50 bg-transparent">
            <a href="#_" onClick={() => IsNavOpen(!NavOpen)}>
              <img className="h-5 w-5" src="/hamburger.png" alt="" />
            </a>
          </div>
          <div className="flex gap-12 md:mr-16">
            <div>
              <div className="md:flex items-center bg-blue-100 rounded-3xl px-3 py-2.5 hidden border-transparent border-2 group focus-within:border-[#09D7C9]">
                <img className="h-5 w-5" src="/search.png" alt="search" />
                <input
                  type="text"
                  placeholder="Search.."
                  className="bg-transparent px-4 focus:outline-none group "
                ></input>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <a href="#_" className="md:hidden">
                <img src="/search.png" alt="searchicon" />
              </a>
              <a href="#_">
                <img src="/assets/travelagency-admin/bell.svg" alt="" />
              </a>
              <a href="#_">
                <img className="h-8 w-8" src="/manager.png" alt="profileicon" />
              </a>
              <a href="#_" onClick={() => IsNavOpen(!NavOpen)}>
                <img src="/hamburger.png" alt="" className="sm:hidden" />
              </a>
            </div>
          </div>
        </div>
        <div className="transition-all duration-1000 ease-in-out">
          <div
            className={`flex flex-col w-full justify-between gap-5 p-5 mt-20 ${
              NavOpen
                ? "md:max-w-[calc(100vw_-_100px)] sm:max-w-[calc(100vw_-_160px)] md:pl-36 transition-all duration-500"
                : "md:max-w-[calc(100vw_-_100px)] transition-all duration-500"
            }`}
          >
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Accommodation Management
              </h1>
              {loading ? (
                <p className="text-lg text-gray-600">
                  Loading accommodations...
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button
                      onClick={toggleAddForm}
                      className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-300"
                    >
                      {showAddForm ? "Cancel" : "Add Accommodation"}
                    </button>
                  </div>
                  {/* Show Add New Accommodation Form when the state is true */}
                  {showAddForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Add New Accommodation
                      </h2>
                      <AccommodationForm
                        onSubmit={handleAddAccommodation} // Add new accommodation
                        refreshAccommodations={fetchAccommodations} // Refresh accommodations after adding
                      />
                    </div>
                  )}
                  {/* Manage Existing Accommodations Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {accommodations.map((accommodation) => (
                      <div
                        key={accommodation._id}
                        className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        {/* Image Section */}
                        <div
                          className="w-full h-56 bg-cover bg-center rounded-lg mb-4"
                          style={{
                            backgroundImage: `url(${
                              accommodation.picture ||
                              "/default-accommodation.jpg"
                            })`,
                          }}
                        ></div>

                        {/* Accommodation Details Section */}
                        <div className="flex flex-col">
                          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                            {accommodation.name}
                          </h3>
                          <p className="text-gray-600 text-base mb-2">
                            {accommodation.description}
                          </p>
                          <p className="text-gray-800 mb-1">
                            <span className="font-bold">Price:</span> $
                            {accommodation.price}
                          </p>
                          <p className="text-gray-800 mb-1">
                            <span className="font-bold">Availability:</span>{" "}
                            <span
                              className={
                                accommodation.isAvailable
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {accommodation.isAvailable
                                ? "Available"
                                : "Not Available"}
                            </span>
                          </p>
                          <p className="text-gray-800">
                            <span className="font-bold">Special Offer:</span>{" "}
                            {accommodation.specialOffer || "No Offer"}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-5 justify-center items-center mt-4">
                            <button
                              onClick={() =>
                                handleSelectAccommodationForUpdate(
                                  accommodation
                                )
                              }
                              className="p-3 rounded-full border border-black hover:bg-gray-200 text-white focus:outline-none transition-all duration-300"
                              title="Update Accommodation"
                            >
                              <img
                                src="/update.png"
                                alt="Update"
                                className="h-6 w-6"
                              />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteAccommodation(accommodation._id)
                              }
                              className="p-3 rounded-full border border-black hover:bg-gray-200 text-white focus:outline-none transition-all duration-300"
                              title="Delete Accommodation"
                            >
                              <img
                                src="/delete.png"
                                alt="Delete"
                                className="h-6 w-6"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Update Accommodation Form */}
                  {selectedAccommodation && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Update Accommodation
                      </h2>
                      <AccommodationForm
                        accommodation={selectedAccommodation} // Pass the selected accommodation for editing
                        onSubmit={handleUpdateAccommodation} // Handle update form submission
                        refreshAccommodations={fetchAccommodations} // Refresh accommodations after updating
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccommodationManagement;
