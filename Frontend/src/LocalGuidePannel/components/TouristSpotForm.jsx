import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createTouristSpot, getTouristSpotById, updateTouristSpot } from '../api/touristSpotApi';

const TouristSpotForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    picture: '',
    nearbyPlaces: [],
    isApproved: false,
  });

  useEffect(() => {
    if (id) {
      fetchSpotData();
    }
  }, [id]);

  const fetchSpotData = async () => {
    try {
      const response = await getTouristSpotById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching spot data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNearbyPlacesChange = (e) => {
    const places = e.target.value.split(',').map(place => place.trim());
    setFormData({ ...formData, nearbyPlaces: places });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateTouristSpot(id, formData);
      } else {
        await createTouristSpot(formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving spot:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Edit' : 'Add'} Tourist Spot</h1>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 font-bold mb-2">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            rows="4"
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="picture" className="block text-gray-700 font-bold mb-2">Picture URL</label>
          <input
            type="url"
            id="picture"
            name="picture"
            value={formData.picture}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="nearbyPlaces" className="block text-gray-700 font-bold mb-2">Nearby Places (comma-separated)</label>
          <input
            type="text"
            id="nearbyPlaces"
            name="nearbyPlaces"
            value={formData.nearbyPlaces.join(', ')}
            onChange={handleNearbyPlacesChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isApproved"
              checked={formData.isApproved}
              onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
              className="mr-2"
            />
            <span className="text-gray-700 font-bold">Is Approved</span>
          </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {id ? 'Update' : 'Create'} Tourist Spot
        </button>
      </form>
    </div>
  );
};

export default TouristSpotForm;

