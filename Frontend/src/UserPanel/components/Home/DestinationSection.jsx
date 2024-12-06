import React from "react";
import DestinationCard from "./DestinationCard";

const destinations = [
  { image: "/images/switzerland.jpg", name: "Switzerland" },
  { image: "/images/maldives.jpg", name: "Maldives" },
  { image: "/images/spain.jpg", name: "Spain" },
  { image: "/images/london.jpg", name: "London" },
];

const DestinationSection = () => {
  return (
    <div className="py-16 bg-white">
      <h2 className="text-3xl font-bold text-center">Most Popular Destinations</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {destinations.map((destination, index) => (
          <DestinationCard key={index} {...destination} />
        ))}
      </div>
    </div>
  );
};

export default DestinationSection;
