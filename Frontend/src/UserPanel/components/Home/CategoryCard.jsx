import React from "react";

const CategoryCard = ({ icon, title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
    </div>
  );
};

export default CategoryCard;
