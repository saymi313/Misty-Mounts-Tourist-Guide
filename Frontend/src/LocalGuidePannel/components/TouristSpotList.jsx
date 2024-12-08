import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllTouristSpots, deleteTouristSpot } from '../api/touristSpotApi';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const TouristSpotList = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const response = await getAllTouristSpots();
      console.log(response);  // Log the entire response object to check the data structure
      setSpots(response.data || response.spots || []);  // Adjust the data access if needed
      setLoading(false);
    } catch (error) {
      setError('Error fetching spots. Please try again later.');
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/local-guide/edit-spot/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this spot?')) {
      try {
        await deleteTouristSpot(id);
        fetchSpots();  // Refresh spots after delete
      } catch (error) {
        setError('Error deleting spot. Please try again.');
      }
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tourist Spots</h1>
        <Link to="/local-guide/add-spot" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
          Add New Spot
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Approved
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {spots.map((spot) => (
              <React.Fragment key={spot._id}>
                {spot.nearbyPlaces.map((place, index) => (
                  <tr key={`${spot._id}-${index}`}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          {/* Ensure the image path is correct */}
                          <img className="w-full h-full rounded-full" src={place.picture || '/path/to/default/image.jpg'} alt={place.name || 'No image available'} />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 whitespace-no-wrap">{place.name || 'No name available'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{place.location || 'No location available'}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {spot.isApproved ? (
                        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                          <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                          <span className="relative flex items-center">
                            <FaCheck className="mr-1" /> Yes
                          </span>
                        </span>
                      ) : (
                        <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                          <span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                          <span className="relative flex items-center">
                            <FaTimes className="mr-1" /> No
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => handleEdit(spot._id)} className="text-indigo-600 hover:text-indigo-900">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(spot._id)} className="text-red-600 hover:text-red-900">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TouristSpotList;
