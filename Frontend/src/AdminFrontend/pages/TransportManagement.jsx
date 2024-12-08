import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import axios from "axios";
import React, { useState, useEffect } from "react";
import SideMenu from "../components/SideMenu";
import TopBar from "../components/TopBar";
const TransportManagement = () => {
  const [NavOpen, IsNavOpen] = useState(false);
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [transportations, setTransportations] = useState([]);
  const [selectedNearbyPlace, setSelectedNearbyPlace] = useState(null); // Set to initial value if needed

  // Example function to set the selected nearby place
  const handleSelectNearbyPlace = (place) => {
    setSelectedNearbyPlace(place);
  };
  const [formData, setFormData] = useState({
    transportType: "",
    Number: "",
    availability: true,
    city: "", // Add city to form data
  });
  const [editingTransport, setEditingTransport] = useState(null); // State for tracking edit mode

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/spots");
      setSpots(response.data);
    } catch (error) {
      console.error("Error fetching spots:", error);
    }
  };

  const fetchTransportations = async (spotId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/transportation/${spotId}`
      );
      setTransportations(response.data);
    } catch (error) {
      console.error("Error fetching transportation:", error);
    }
  };
  const handleSelectSpot = (spot, nearbyPlace) => {
    setSelectedSpot(spot); // Set the selected spot
    setSelectedNearbyPlace(nearbyPlace); // Set the selected nearby place
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTransportation = async () => {
    try {
      if (editingTransport) {
        await axios.put(
          `http://localhost:5000/api/admin/transportation/${editingTransport._id}`,
          formData
        );
        setEditingTransport(null); // Reset edit mode
      } else {
        await axios.post("http://localhost:5000/api/admin/transportation", {
          ...formData,
          spotId: selectedSpot._id,
        });
      }
      fetchTransportations(selectedSpot._id);
      setFormData({ transportType: "", Number: "", availability: true });
    } catch (error) {
      console.error("Error adding/updating transportation:", error);
    }
  };

  const handleEditTransportation = (transport) => {
    setEditingTransport(transport);
    setFormData({
      transportType: transport.transportType,
      Number: transport.Number,
      availability: transport.availability,
    });
  };

  const handleDeleteTransportation = async (transportId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/transportation/${transportId}`
      );
      fetchTransportations(selectedSpot._id);
    } catch (error) {
      console.error("Error deleting transportation:", error);
    }
  };
  const navigate = useNavigate(); // Initialize navigate

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
  const goToPaymentManagement = () => {
    navigate("/admin/payments"); // Navigating to the tourist spots management page
  };

  return (
    <div className="flex">
       <SideMenu
        NavOpen={NavOpen}
        IsNavOpen={IsNavOpen}
        goToAdminDashboard={goToAdminDashboard}
        goToAccommodationManagement={goToAccommodationManagement}
        goToTouristSpotManagement={goToTouristSpotManagement}
        goToTransportManagement={goToTransportManagement}
        goToPaymentManagement={goToPaymentManagement}
      />
      <div className="w-full flex flex-col md:ml-20">
        <TopBar NavOpen={NavOpen} IsNavOpen={IsNavOpen} />
        <div className="transition-all duration-1000 ease-in-out">
        <div
            className={`flex flex-col w-full justify-between gap-5 p-5 mt-20 ${
              NavOpen
                ? "md:max-w-[calc(100vw_-_100px)] sm:max-w-[calc(100vw_-_160px)] md:pl-36 transition-all duration-500"
                : "md:max-w-[calc(100vw_-_100px)] transition-all duration-500"
            }`}
          >
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Transport Management</h1>

              {/* Spot Selection */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Select Tourist Spot
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                  {spots.map((spot) => (
                    <div key={spot._id}>
                      {/* Displaying city name */}
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {spot.city}
                      </h3>

                      {/* Iterate through all nearby places of the current spot */}
                      {spot.nearbyPlaces.map((nearbyPlace) => (
                        <div
                          key={nearbyPlace._id}
                          className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 mb-10"
                          onClick={() => handleSelectSpot(spot, nearbyPlace)} // Pass both spot and nearbyPlace
                        >
                          <img
                            src={
                              nearbyPlace.picture ||
                              "https://via.placeholder.com/150"
                            }
                            alt={nearbyPlace.name}
                            className="h-40 w-full object-cover"
                          />
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-700">
                              {nearbyPlace.name}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transportation Details */}
              {selectedNearbyPlace && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Transport for {selectedNearbyPlace.name}{" "}
                    {/* Display the selected nearby place name */}
                  </h2>
                  <ul>
                    {transportations.map((transport) => (
                      <li key={transport._id} className="flex justify-between">
                        <span>
                         <p>Type : {transport.transportType}</p>
                         <p>Phone Number:+92{transport.Number}</p>
                         <p> {transport.availability
                            ? "Available"
                            : "Not Available"}</p>
                        </span>
                        <div>
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                            onClick={() => handleEditTransportation(transport)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-4 py-2 bg-red-500 text-white rounded"
                            onClick={() =>
                              handleDeleteTransportation(transport._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Add/Edit Transportation Form */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {editingTransport
                        ? "Edit Transportation"
                        : "Add Transportation"}
                    </h3>
                    {/* Form to Add/Edit Transportation */}
                    <input
                      type="text"
                      name="transportType"
                      value={formData.transportType}
                      placeholder="Type (e.g., Bus, Taxi)"
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded mb-2"
                    />
                    <input
                      type="number"
                      name="Number"
                      value={formData.Number}
                      placeholder="Phone Number"
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded mb-2"
                    />
                    <div className="mb-2">
                      <label className="mr-4">Availability:</label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availability: e.target.value === "true",
                          })
                        }
                        className="p-2 border border-gray-300 rounded"
                      >
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddTransportation}
                      className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                      {editingTransport
                        ? "Update Transportation"
                        : "Add Transportation"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportManagement;
