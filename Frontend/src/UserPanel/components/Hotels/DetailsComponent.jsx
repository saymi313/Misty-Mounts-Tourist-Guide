import React from 'react';
import { FaBed, FaCouch, FaBath, FaUtensils, FaWifi, FaTv } from 'react-icons/fa';
import { MdKitchen } from 'react-icons/md';

const DetailsComponent = () => {
  const details = [
    { icon: <FaBed className="text-xl text-blue-600" />, label: "1 bedroom" },
    { icon: <FaCouch className="text-xl text-blue-600" />, label: "1 living room" },
    { icon: <FaBath className="text-xl text-blue-600" />, label: "1 bathroom" },
    { icon: <FaUtensils className="text-xl text-blue-600" />, label: "1 dining room" },
    { icon: <FaWifi className="text-xl text-blue-600" />, label: "10 mbp/s" },
    { icon: <MdKitchen className="text-xl text-blue-600" />, label: "1 refrigerator" },
    { icon: <FaTv className="text-xl text-blue-600" />, label: "2 televisions" },
  ];

  return (
    <div className="flex justify-between px-8 py-6">
      {details.map((detail, index) => (
        <div key={index} className="flex flex-col items-center">
          {detail.icon}
          <p className="mt-2 text-sm text-gray-600">{detail.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DetailsComponent;
