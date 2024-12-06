import React, { useState, useEffect } from 'react';

const AccommodationForm = ({ onSubmit, accommodation = {}, refreshAccommodations }) => {
  // Initialize state with default values if accommodation data is provided
  const [name, setName] = useState(accommodation?.name || "");
  const [description, setDescription] = useState(accommodation?.description || "");
  const [price, setPrice] = useState(accommodation?.price || "");
  const [isAvailable, setIsAvailable] = useState(accommodation?.isAvailable || false);
  const [specialOffer, setSpecialOffer] = useState(accommodation?.specialOffer || "");

  // Prevent form from resetting by using useEffect and adding dependencies only for initial load.
  useEffect(() => {
    if (accommodation?.id) {
      // Only set initial state if accommodation ID exists (indicating that this is an edit form)
      setName(accommodation.name || "");
      setDescription(accommodation.description || "");
      setPrice(accommodation.price || "");
      setIsAvailable(accommodation.isAvailable || false);
      setSpecialOffer(accommodation.specialOffer || "");
    }
  }, [accommodation?.id]);  // Runs only when accommodation ID changes (indicating edit mode)

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAccommodation = {
      name,
      description,
      price,
      isAvailable,
      specialOffer
    };

    onSubmit(newAccommodation); // Submit the form data

    // Optionally clear the form after submission
    setName("");
    setDescription("");
    setPrice("");
    setIsAvailable(false);
    setSpecialOffer("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name:</label>
      <input
        type="text"
        value={name}  // Controlled value
        onChange={(e) => setName(e.target.value)}  // Update state on input change
        required
      />

      <label>Description:</label>
      <input
        type="text"
        value={description}  // Controlled value
        onChange={(e) => setDescription(e.target.value)}  // Update state on input change
        required
      />

      <label>Price:</label>
      <input
        type="number"
        value={price}  // Controlled value
        onChange={(e) => setPrice(e.target.value)}  // Update state on input change
        required
      />

      <label>Available:</label>
      <input
        type="checkbox"
        checked={isAvailable}  // Controlled value
        onChange={(e) => setIsAvailable(e.target.checked)}  // Update state on checkbox change
      />

      <label>Special Offer:</label>
      <input
        type="text"
        value={specialOffer}  // Controlled value
        onChange={(e) => setSpecialOffer(e.target.value)}  // Update state on input change
      />

      <button type="submit">Submit</button>
    </form>
  );
};

export default AccommodationForm;
