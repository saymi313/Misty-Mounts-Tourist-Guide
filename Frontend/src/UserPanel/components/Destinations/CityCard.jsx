import React from 'react';

const CityCard = ({ title, duration, transport, familyPlan }) => {
  return (
    <div className="border rounded-lg shadow-lg p-4">
      <img
        src="/path-to-card-image.jpg"
        alt={title}
        className="w-full h-40 object-cover rounded-t-lg mb-4"
      />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 mt-2">Duration: {duration}</p>
      <p className="text-gray-600">Transport: {transport}</p>
      <p className="text-gray-600">Plan: {familyPlan}</p>
    </div>
  );
};

export default CityCard;
