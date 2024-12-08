import React from 'react';
import { Link } from 'react-router-dom';

const CityCard = ({ name, location, picture, city, spotId }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={picture} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600">{location}</p>
        <Link
          to={`/city/${city}/spot/${spotId}`}
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default CityCard;
