import React from "react";
import TripPackageCard from "./TripPackageCard";

const tripPackages = [
  {
    title: "Beach Paradise",
    description: "Enjoy a relaxing beach getaway with all-inclusive amenities.",
    image: "/images/beach.jpg",
  },
  {
    title: "Mountain Adventure",
    description: "Explore the mountains with guided tours and outdoor activities.",
    image: "/images/mountain.jpg",
  },
  {
    title: "City Exploration",
    description: "Discover the best urban experiences with city tours and events.",
    image: "/images/city.jpg",
  },
  {
    title: "Jungle Safari",
    description: "Embark on an exciting safari adventure in the heart of the jungle.",
    image: "/images/safari.jpg",
  },
];

const TripPackageSection = () => {
  return (
    <div className="py-16 bg-blue-100">
      <h2 className="text-3xl font-bold text-center">Trip Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {tripPackages.map((packageItem, index) => (
          <TripPackageCard key={index} {...packageItem} />
        ))}
      </div>
    </div>
  );
};

export default TripPackageSection;
