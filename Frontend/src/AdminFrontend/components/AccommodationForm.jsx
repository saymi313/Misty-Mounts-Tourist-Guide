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
    
    // Reset form after submission
    setName("");
    setDescription("");
    setPrice("");
    setIsAvailable(false);
    setSpecialOffer("");
    setPicture(""); // Clear the picture input after submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price:</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center space-x-3">
        <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available:</label>
        <input
          id="isAvailable"
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-5 w-5 text-blue-500 border-gray-300 rounded"
        />
      </div>

      <div>
        <label htmlFor="specialOffer" className="block text-sm font-medium text-gray-700">Special Offer:</label>
        <input
          id="specialOffer"
          type="text"
          value={specialOffer}
          onChange={(e) => setSpecialOffer(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="picture" className="block text-sm font-medium text-gray-700">Picture URL:</label>
        <input
          id="picture"
          type="text"
          value={picture}
          onChange={(e) => setPicture(e.target.value)}
          placeholder="Enter the picture URL"
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-between gap-4">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-300 w-full"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default AccommodationForm;
