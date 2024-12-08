import React from "react";
import CategoryCard from "./CategoryCard";

const categories = [
  { icon: "🌪", title: "Natural Disaster", detail:"Stay informed about potential natural disasters with real-time alerts and safety tips. Ensure you're prepared, wherever you go." },
  { icon: "🌄", title: "Transport", detail: "Discover hidden gems and offbeat locations to explore. Make your trips memorable with unique, lesser-known destinations."},
  { icon: "🏨", title: "Hotel", detail:"Find and book the best accommodations effortlessly. Compare options, read reviews, and secure your stay with just a tap." },
  { icon: "🚖", title: "Hidden Spots", detail:"Navigate with ease! Access local transport options, schedules, and bookings to get where you need to go smoothly." },
];

const CategorySection = () => {
  return (
    <div className="px-20">
      <h2 className="text-3xl font-bold text-center">Our Popular Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {categories.map((category, index) => (
          <CategoryCard key={index} {...category} />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
