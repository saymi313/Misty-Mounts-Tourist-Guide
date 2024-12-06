import React, { useState, useEffect } from "react";

const TouristSpotForm = ({ spot, onSubmit, refreshSpots }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (spot) {
      setName(spot.name);
      setLocation(spot.location);
      setDescription(spot.description);
    }
  }, [spot]); // Populate form with spot data when selected

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSpot = { name, location, description };
    onSubmit(newSpot); // Call the onSubmit function passed as prop
    setName(""); // Reset the form after submission
    setLocation("");
    setDescription("");
    refreshSpots(); // Refresh spots after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Location:</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <button type="submit">{spot ? "Update Spot" : "Add Spot"}</button>
    </form>
  );
};

export default TouristSpotForm;
