import React, { useEffect, useState } from "react";
import axios from "axios";
import DestinationCard from "./DestinationCard";

const DestinationSection = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch tourist spots using axios
    axios.get("http://localhost:5000/api/admin/spots") // Make a GET request to the backend
      .then((response) => {
        const data = response.data;

        // Check if data exists and is an array
        if (data && Array.isArray(data)) {
          // Limit the total number of cards to 4 by flattening all nearby places
          const allNearbyPlaces = data.flatMap((spot) => 
            spot.nearbyPlaces && Array.isArray(spot.nearbyPlaces) ? spot.nearbyPlaces : []
          );

          // Get the first 4 places
          const limitedNearbyPlaces = allNearbyPlaces.slice(0, 4);

          setDestinations(limitedNearbyPlaces); // Update the destinations state with limited places
        } else {
          setDestinations([]); // Set empty array if no data
        }
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((error) => {
        console.error("Error fetching destinations:", error);
        setError("Failed to load destinations");
        setLoading(false); // Stop loading in case of error
      });
  }, []);

  if (loading) {
    return (
      <div className="py-16 px-2">
        <h2 className="text-3xl font-bold text-center">Most Popular Destinations</h2>
        <div className="flex justify-center items-center mt-8">
          <div className="text-lg text-gray-600">Loading destinations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 px-2">
        <h2 className="text-3xl font-bold text-center">Most Popular Destinations</h2>
        <div className="flex justify-center items-center mt-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="py-16 px-2">
        <h2 className="text-3xl font-bold text-center">Most Popular Destinations</h2>
        <div className="flex justify-center items-center mt-8">
          <div className="text-lg text-gray-600">No destinations available at the moment.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-2">
      <h2 className="text-3xl font-bold text-center">Most Popular Destinations</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {destinations.map((place, index) => (
          <DestinationCard
            key={index}
            image={place.picture}
            name={place.name}
            location={place.location}
            description={place.description}
          />
        ))}
      </div>
    </div>
  );
};

export default DestinationSection;
