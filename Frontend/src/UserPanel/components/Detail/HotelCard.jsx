import React from 'react';
import { useNavigate } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    // Navigate to the hotel detail page using the hotel id
    navigate(`/accommodations/${hotel._id}`);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <img
        src={hotel.picture}
        alt={hotel.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold">{hotel.name}</h3>
        <p className="text-gray-600 mt-2">{hotel.description}</p>
        <p className="text-lg font-semibold mt-4">Price: ${hotel.price}</p>
        <button
          onClick={handleViewClick}
          className="bg-blue-500 text-white my-1 py-1 px-6 rounded-lg text-lg hover:bg-blue-600 hover:scale-105 focus:outline-none transition-all duration-300"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default HotelCard;
