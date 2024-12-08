import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTouristSpotById, updateTouristSpot, addNearbyPlace, updateNearbyPlace, deleteNearbyPlace } from '../api/touristSpotApi.jsx';
import NearbyPlaceForm from '../components/NearbyPlaceForm';

const EditTouristSpotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNearbyPlaceForm, setShowNearbyPlaceForm] = useState(false);
  const [editingNearbyPlace, setEditingNearbyPlace] = useState(null);

  useEffect(() => {
    fetchSpot();
  }, [id]);

  const fetchSpot = async () => {
    try {
      setLoading(true);
      const response = await getTouristSpotById(id);
      setSpot(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching tourist spot. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSpot(prevSpot => ({ ...prevSpot, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTouristSpot(id, spot);
      navigate('/local-guide');
    } catch (err) {
      setError('Error updating tourist spot. Please try again.');
    }
  };

  const handleAddNearbyPlace = async (newPlace) => {
    try {
      const response = await addNearbyPlace(id, newPlace);
      setSpot(response.data);
      setShowNearbyPlaceForm(false);
    } catch (error) {
      setError('Error adding nearby place. Please try again.');
    }
  };

  const handleUpdateNearbyPlace = async (updatedPlace) => {
    try {
      const response = await updateNearbyPlace(id, editingNearbyPlace._id, updatedPlace);
      setSpot(response.data);
      setEditingNearbyPlace(null);
    } catch (error) {
      setError('Error updating nearby place. Please try again.');
    }
  };

  const handleDeleteNearbyPlace = async (placeId) => {
    if (window.confirm('Are you sure you want to delete this nearby place?')) {
      try {
        const response = await deleteNearbyPlace(id, placeId);
        setSpot(response.data);
      } catch (error) {
        setError('Error deleting nearby place. Please try again.');
      }
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Tourist Spot</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={spot.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={spot.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={spot.description}
            onChange={handleChange}
            required
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Nearby Places</h3>
          {spot.nearbyPlaces.map((place) => (
            <div key={place._id} className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
              <div>
                <p><strong>Name:</strong> {place.name}</p>
                <p><strong>Location:</strong> {place.location}</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setEditingNearbyPlace(place)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNearbyPlace(place._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
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

        {(showNearbyPlaceForm || editingNearbyPlace) && (
          <NearbyPlaceForm
            onSubmit={editingNearbyPlace ? handleUpdateNearbyPlace : handleAddNearbyPlace}
            onCancel={() => {
              setShowNearbyPlaceForm(false);
              setEditingNearbyPlace(null);
            }}
            initialData={editingNearbyPlace}
          />
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
            Update Tourist Spot
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTouristSpotPage;

