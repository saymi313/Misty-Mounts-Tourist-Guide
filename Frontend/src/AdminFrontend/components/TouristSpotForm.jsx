import React, { useState, useEffect } from "react";

const TouristSpotForm = ({ spot, onSubmit, refreshSpots }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [pictureUrl, setPictureUrl] = useState(""); // Handle the URL input for picture

  useEffect(() => {
    if (spot) {
      setName(spot.name);
      setLocation(spot.location);
      setDescription(spot.description);
      setPictureUrl(spot.picture); // If updating, populate picture URL
    }
  }, [spot]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSpot = { name, location, description, picture: pictureUrl };

    // Call the onSubmit function with the new spot data
    onSubmit(newSpot);

    setName(""); // Reset the form after submission
    setLocation("");
    setDescription("");
    setPictureUrl(""); // Reset picture URL field
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
      <div>
        <label>Picture URL:</label>
        <input
          type="url"
          value={pictureUrl}
          onChange={(e) => setPictureUrl(e.target.value)} // Update picture URL
          required
          placeholder="Enter a valid image URL"
        />
      </div>
      <button type="submit">{spot ? "Update Spot" : "Add Spot"}</button>
    </form>
  );
};

export default TouristSpotForm;
