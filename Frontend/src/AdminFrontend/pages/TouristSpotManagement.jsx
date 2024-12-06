import React, { useState, useEffect } from "react";
import axios from "axios";
import TouristSpotForm from "../components/TouristSpotForm"; // Assuming this form handles adding and updating spots

const TouristSpotManagement = () => {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true); // Initially set loading to true
    const [selectedSpot, setSelectedSpot] = useState(null); // For updating a spot
  
    // Fetch all spots
    const fetchSpots = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/spots");
        setSpots(response.data);
        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error("Error fetching tourist spots:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };
  
    useEffect(() => {
      fetchSpots();
    }, []); // Fetch spots on component mount
  
    // Handle spot approval or rejection
    const handleApproval = async (id, isApproved) => {
      try {
        await axios.patch(`http://localhost:5000/api/admin/spots/${id}/approve`, { isApproved });
        fetchSpots(); // Refresh spots after approval
      } catch (error) {
        console.error(`Error ${isApproved ? "approving" : "rejecting"} spot:`, error);
      }
    };
  
    // Handle adding a new spot
    const handleAddSpot = async (newSpot) => {
      try {
        await axios.post("http://localhost:5000/api/admin/spots", newSpot);
        fetchSpots(); // Refresh the spots after adding
      } catch (error) {
        console.error("Error adding tourist spot:", error);
      }
    };
  
    // Handle updating a spot
    const handleUpdateSpot = async (updatedSpot) => {
      if (!selectedSpot) return;
      try {
        await axios.put(`http://localhost:5000/api/admin/spots/${selectedSpot._id}`, updatedSpot);
        fetchSpots(); // Refresh the spots after updating
        setSelectedSpot(null); // Reset the selected spot after update
      } catch (error) {
        console.error("Error updating tourist spot:", error);
      }
    };
  
    // Handle deleting a spot
    const handleDeleteSpot = async (id) => {
      try {
        await axios.delete(`http://localhost:5000/api/admin/spots/${id}`);
        fetchSpots(); // Refresh the spots after deletion
      } catch (error) {
        console.error("Error deleting tourist spot:", error);
      }
    };
  
    // Handle selecting a spot for update
    const handleSelectSpotForUpdate = (spot) => {
      setSelectedSpot(spot); // Set the selected spot to be updated
    };
  
    return (
      <div>
        <h1>Tourist Spot Management</h1>
        {loading ? (
          <p>Loading spots...</p>
        ) : (
          <div>
            <h2>{selectedSpot ? "Update Tourist Spot" : "Add New Tourist Spot"}</h2>
            <TouristSpotForm
              spot={selectedSpot} // Pass the selected spot for editing
              onSubmit={selectedSpot ? handleUpdateSpot : handleAddSpot} // Handle form submission based on mode
              refreshSpots={fetchSpots} // Refresh spots after adding or updating
            />
  
            <h2>Manage Existing Spots</h2>
            <ul>
              {spots.map((spot) => (
                <li key={spot._id}>
                  <h3>{spot.name}</h3>
                  <p>{spot.description}</p>
                  <p>Status: {spot.isApproved ? "Approved" : "Pending"}</p>
                  <button onClick={() => handleApproval(spot._id, true)}>Approve</button>
                  <button onClick={() => handleApproval(spot._id, false)}>Reject</button>
                  <button onClick={() => handleSelectSpotForUpdate(spot)}>Update</button>
                  <button onClick={() => handleDeleteSpot(spot._id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  export default TouristSpotManagement;
  