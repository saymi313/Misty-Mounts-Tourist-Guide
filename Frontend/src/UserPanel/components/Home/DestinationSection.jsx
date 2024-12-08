import React, { useEffect, useState } from "react";
import axios from "axios";
import DestinationCard from "./DestinationCard";

const DestinationSection = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch tourist spots using axios
    axios.get("http://localhost:5000/api/admin/spots") // Make a GET request to the backend
      .then((response) => {
        const data = response.data;

        // Limit the total number of cards to 4 by flattening all nearby places
        const allNearbyPlaces = data.flatMap((spot) => spot.nearbyPlaces);

        // Get the first 4 places
        const limitedNearbyPlaces = allNearbyPlaces.slice(0, 4);

        setDestinations(limitedNearbyPlaces); // Update the destinations state with limited places
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((error) => {
        console.error("Error fetching destinations:", error);
        setLoading(false); // Stop loading in case of error
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while fetching data
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
