import React, { useState, useEffect } from "react";

const TouristSpotForm = ({ spot, onSubmit, onClose }) => {
  const [city, setCity] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Populate the form with spot data if available
  useEffect(() => {
    if (spot) {
      setCity(spot.city || "");
      setNearbyPlaces(spot.nearbyPlaces || []);
    }
  }, [spot]);

  const handleAddNearbyPlace = () => {
    setNearbyPlaces([
      ...nearbyPlaces,
      { name: "", location: "", description: "", picture: "" },
    ]);
  };

  const handleNearbyPlaceChange = (index, field, value) => {
    const updatedPlaces = nearbyPlaces.map((place, i) =>
      i === index ? { ...place, [field]: value } : place
    );
    setNearbyPlaces(updatedPlaces);
  };

  const handleRemoveNearbyPlace = (index) => {
    const updatedPlaces = nearbyPlaces.filter((_, i) => i !== index);
    setNearbyPlaces(updatedPlaces);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedTouristSpot = { city, nearbyPlaces };
    onSubmit(updatedTouristSpot); // Send updated data to the parent

    // Reset the form if not editing
    if (!spot) {
      setCity("");
      setNearbyPlaces([]);
    }

    // Close the form
    if (onClose) {
      onClose();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 bg-white rounded-lg shadow-lg"
    >
      {/* City Input */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          City:
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Nearby Places */}
      {nearbyPlaces.map((place, index) => (
        <div key={index} className="border p-4 mb-4 rounded-md bg-gray-50">
          <h4 className="font-medium text-gray-800">Nearby Place {index + 1}</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={place.name}
              onChange={(e) =>
                handleNearbyPlaceChange(index, "name", e.target.value)
              }
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={place.location}
              onChange={(e) =>
                handleNearbyPlaceChange(index, "location", e.target.value)
              }
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description"
              value={place.description}
              onChange={(e) =>
                handleNearbyPlaceChange(index, "description", e.target.value)
              }
              required
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="Picture URL"
              value={place.picture}
              onChange={(e) =>
                handleNearbyPlaceChange(index, "picture", e.target.value)
              }
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveNearbyPlace(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove Nearby Place
            </button>
          </div>
        </div>
      ))}

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleAddNearbyPlace}
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors duration-300"
        >
          Add Nearby Place
        </button>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-300 w-full"
        >
          {spot ? "Update Tourist Spot" : "Submit Tourist Spot"}
        </button>
      </div>
    </form>
  );
};

export default TouristSpotForm;
