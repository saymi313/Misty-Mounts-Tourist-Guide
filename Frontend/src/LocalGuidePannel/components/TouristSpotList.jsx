import React, { useState, useEffect } from 'react';
import { getAllTouristSpots, deleteTouristSpot } from '../api/touristSpotApi';
import { Link } from 'react-router-dom';

const TouristSpotList = () => {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await getAllTouristSpots();
      setSpots(response.data);
    } catch (error) {
      console.error('Error fetching spots:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this spot?')) {
      try {
        await deleteTouristSpot(id);
        fetchSpots();
      } catch (error) {
        console.error('Error deleting spot:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tourist Spots</h1>
      <Link to="/add-spot" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block">
        Add New Spot
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spots.map((spot) => (
          <div key={spot._id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <img src={spot.picture} alt={spot.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{spot.name}</h2>
              <p className="text-gray-600 mb-2">{spot.location}</p>
              <p className="text-sm text-gray-500 mb-4">{spot.description.substring(0, 100)}...</p>
              <div className="flex justify-between">
                <Link to={`/edit-spot/${spot._id}`} className="text-blue-500 hover:underline">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(spot._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TouristSpotList;

