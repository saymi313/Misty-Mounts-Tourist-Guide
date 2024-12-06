import React from "react";

const DestinationCard = ({ image, name }) => {
  return (
    <div className="relative">
      <img src={image} alt={name} className="w-full h-64 object-cover rounded-lg" />
      <h3 className="absolute bottom-4 left-4 text-white font-bold text-lg">{name}</h3>
    </div>
  );
};

export default DestinationCard;
