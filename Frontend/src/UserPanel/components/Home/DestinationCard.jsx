// DestinationCard.js
import React from "react";

const DestinationCard = ({ image, name, location, description }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-lg mb-4" />
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-gray-500">{location}</p>
      <p className="text-gray-700 mt-2">{description}</p>
    </div>
  );
};

export default DestinationCard;
