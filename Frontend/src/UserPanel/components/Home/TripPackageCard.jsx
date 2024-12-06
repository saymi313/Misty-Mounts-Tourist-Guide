import React from "react";

const TripPackageCard = ({ title, description, image }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <button className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-md hover:bg-indigo-600">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default TripPackageCard;
