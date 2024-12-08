import React from "react";
import TripPackageCard from "./TripPackageCard";
import axios from "axios";
import { useState,useEffect } from "react";

const TripPackageSection = () => {
  const [Reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize   state

  useEffect(() => {
    fetchReviews();
  }, []);
  const fetchReviews = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/");

      // Check if response has a specific structure
      if (response.data && response.data.feedbacks) {
        setReviews(response.data.feedbacks);
      } else {
        setReviews([]); // Set an empty array if no feedbacks are available
      }

      setLoading(false); // Stop loading spinner after data is fetched
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false); // Stop loading spinner in case of error
    }
  };
  return (
    <div className="py-16 px-20">
      <h2 className="text-3xl font-bold text-center">Customer Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {Reviews.map((packageItem, index) => (
          <TripPackageCard key={index} {...packageItem} />
        ))}
      </div>
    </div>
  );
};

export default TripPackageSection;
