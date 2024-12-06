import React, { useState, useEffect } from 'react';

const AccommodationForm = ({ onSubmit, accommodation = {}, refreshAccommodations }) => {
  const [name, setName] = useState(accommodation?.name || "");
  const [description, setDescription] = useState(accommodation?.description || "");
  const [price, setPrice] = useState(accommodation?.price || "");
  const [isAvailable, setIsAvailable] = useState(accommodation?.isAvailable || false);
  const [specialOffer, setSpecialOffer] = useState(accommodation?.specialOffer || "");
  const [picture, setPicture] = useState(accommodation?.picture || ""); // Store the picture URL

  useEffect(() => {
    if (accommodation?.id) {
      setName(accommodation.name || "");
      setDescription(accommodation.description || "");
      setPrice(accommodation.price || "");
      setIsAvailable(accommodation.isAvailable || false);
      setSpecialOffer(accommodation.specialOffer || "");
      setPicture(accommodation.picture || ""); // Set picture URL when in edit mode
    }
  }, [accommodation?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAccommodation = {
      name,
      description,
      price,
      isAvailable,
      specialOffer,
      picture,  // Add picture URL to the object
    };

    onSubmit(newAccommodation);
    
    setName("");
    setDescription("");
    setPrice("");
    setIsAvailable(false);
    setSpecialOffer("");
    setPicture(""); // Clear the picture input after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name:</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label>Description:</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <label>Price:</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <label>Available:</label>
      <input
        type="checkbox"
        checked={isAvailable}
        onChange={(e) => setIsAvailable(e.target.checked)}
      />

      <label>Special Offer:</label>
      <input
        type="text"
        value={specialOffer}
        onChange={(e) => setSpecialOffer(e.target.value)}
      />

      <label>Picture URL:</label>
      <input
        type="text"
        value={picture}
        onChange={(e) => setPicture(e.target.value)}
        placeholder="Enter the picture URL"
        required
      />

      <button type="submit">Submit</button>
    </form>
  );
};

export default AccommodationForm;
