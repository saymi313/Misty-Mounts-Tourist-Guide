import React from "react";
import CategoryCard from "./CategoryCard";

const categories = [
  { icon: "🌴", title: "Beaches" },
  { icon: "🏔️", title: "Mountains" },
  { icon: "🗺️", title: "Tours" },
  { icon: "✈️", title: "Travel" },
];

const CategorySection = () => {
  return (
    <div className="py-16 bg-blue-100">
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
