import React from "react";

const CategoryCard = ({ icon, title,detail }) => {
  return (
<div className="bg-white flex flex-col gap-4 py-10 p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:scale-105 hover:shadow-lg">
<div className="text-4xl">{icon}</div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p>{detail}</p>
    </div>
  );
};

export default CategoryCard;
