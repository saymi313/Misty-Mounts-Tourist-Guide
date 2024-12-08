import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTouristSpot } from '../api/touristSpotApi.jsx';
import NearbyPlaceForm from './NearbyPlaceForm';
import axios from 'axios';

const AddTouristSpot = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showNearbyPlaceForm, setShowNearbyPlaceForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      city,
      nearbyPlaces,
    };
  
    console.log("Payload being sent:", payload);
    try {
      await axios.post('http://localhost:5000/api/local-guide/spots', payload); // Ensure backend expects `city` and `nearbyPlaces`
      alert('Spot added successfully!');
      navigate('/local-guide');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Failed to add the spot. Please try again.');
    }
  };
  
  const handleAddNearbyPlace = (newPlace) => {
    setNearbyPlaces([...nearbyPlaces, newPlace]);
    setShowNearbyPlaceForm(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Add Tourist Spot</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Nearby Places</h3>
          {nearbyPlaces.map((place, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
              <p><strong>Name:</strong> {place.name}</p>
              <p><strong>Location:</strong> {place.location}</p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowNearbyPlaceForm(true)}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Nearby Place
          </button>
        </div>

        {showNearbyPlaceForm && (
          <NearbyPlaceForm onSubmit={handleAddNearbyPlace} onCancel={() => setShowNearbyPlaceForm(false)} />
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/local-guide')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Tourist Spot
          </button>
        </div>
      </form>
    </div>
  );
};  

export default AddTouristSpot;
