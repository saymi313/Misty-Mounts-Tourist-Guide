import React, { useState, useEffect } from "react";
import axios from "axios";
import AccommodationForm from "../components/AccommodationForm"; // Assuming this form handles adding and updating accommodations

const AccommodationManagement = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true); // Initially set loading to true
  const [selectedAccommodation, setSelectedAccommodation] = useState(null); // For updating an accommodation

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

  return (
    <div>
      <h1>Accommodation Management</h1>
      {loading ? (
        <p>Loading accommodations...</p>
      ) : (
        <div>
          <h2>Add New Accommodation</h2>
          <AccommodationForm
            onSubmit={handleAddAccommodation} // Add new accommodation
            refreshAccommodations={fetchAccommodations} // Refresh accommodations after adding
          />

          <h2>Manage Existing Accommodations</h2>
          <ul>
            {accommodations.map((accommodation) => (
              <li key={accommodation._id}>
                <h3>{accommodation.name}</h3>
                <p>{accommodation.description}</p>
                <p>Price: {accommodation.price}</p>
                <p>
                  Availability:{" "}
                  {accommodation.isAvailable ? "Available" : "Not Available"}
                </p>
                <p>
                  Special Offer:{" "}
                  {accommodation.specialOffer
                    ? accommodation.specialOffer
                    : "No Offer"}
                </p>
                <button
                  onClick={() =>
                    handleSelectAccommodationForUpdate(accommodation)
                  }
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteAccommodation(accommodation._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {selectedAccommodation && (
            <div>
              <h2>Update Accommodation</h2>
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
  );
};

export default AccommodationManagement;
