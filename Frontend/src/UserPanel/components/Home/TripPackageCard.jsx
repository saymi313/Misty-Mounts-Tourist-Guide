import React from "react";

const TripPackageCard = ({ locationName, rating, message }) => {
  // Function to generate stars based on the rating
  const renderStars = (rating) => {
    const totalStars = 5;
    return (
      <div className="flex">
        {Array.from({ length: totalStars }, (_, index) => (
          <span key={index} className={`text-yellow-500 text-lg`}>
            {index < rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-xl text-center font-semibold mb-2">{locationName}</h3>
        <div className="mb-2 flex justify-center">{renderStars(rating)}</div> {/* Display stars */}
        <p className="text-sm text-center text-gray-600 mb-4">{message}</p>
      </div>
    </div>
  );
};

export default TripPackageCard;
