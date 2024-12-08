import React from 'react';

const CityCard = ({ name, location, picture }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={picture} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600">{location}</p>
      </div>
    </div>
  );
};

export default CityCard;

