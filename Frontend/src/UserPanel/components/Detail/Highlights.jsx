import React, { useEffect, useState } from "react";
import axios from "axios";

const Highlights = () => {
  // State for fetched data, loading, and errors
  const [highlight, setHighlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHighlight = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/natural-disaster/");
        const data = response.data.data || [];
        setHighlight(data[0] || null); // Show the 0th index
      } catch (error) {
        setError("Failed to fetch natural disasters. Please try again later.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlight();
  }, []);

  return (
    <div className="bg-blue-50 text-white min-h-screen">
      <h1 className="text-center text-4xl font-extrabold py-6 text-yellow-400">
        🚨 Natural Disaster Alert 🚨
      </h1>
      {loading ? (
        <p className="text-center text-yellow-300 py-10">Loading the latest information...</p>
      ) : error ? (
        <p className="text-center text-red-300 py-10">{error}</p>
      ) : highlight ? (
        <div className="max-w-4xl mx-auto p-6 bg-red-800 border-4 border-yellow-500 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center space-x-4">
            <span className="text-6xl">⚠️</span>
            <h2 className="text-3xl font-bold">{highlight.name}</h2>
          </div>
          <p className="text-lg mt-4">
            <strong>📍 Location:</strong> {highlight.location}
          </p>
          <p className="text-lg mt-2">
            <strong>📝 Description:</strong> {highlight.description}
          </p>
          <p className="text-lg mt-2">
            <strong>📅 Date:</strong> {new Date(highlight.date).toLocaleDateString()}
          </p>
          <p className="text-lg mt-2">
            <strong>⚡ Severity:</strong>{" "}
            <span
              className={
                highlight.severity === "High"
                  ? "text-red-500 font-bold"
                  : highlight.severity === "Medium"
                  ? "text-yellow-500 font-bold"
                  : "text-green-500 font-bold"
              }
            >
              {highlight.severity}
            </span>
          </p>
          <p className="text-lg mt-2">
            <strong>✔️ Resolved:</strong>{" "}
            <span className={highlight.isResolved ? "text-green-400" : "text-red-400"}>
              {highlight.isResolved ? "Yes" : "No"}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-center text-yellow-300 py-10">No natural disasters found.</p>
      )}
    </div>
  );
};

export default Highlights;
