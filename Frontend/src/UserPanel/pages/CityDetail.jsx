import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Detail/Header';
import HeroSection from '../components/Detail/HeroSection';
import Highlights from '../components/Detail/Highlights';
import Description from '../components/Detail/Description';
import Activity from '../components/Detail/Activity';
import Map from '../components/Detail/Map';
import HotelCard from '../components/Detail/HotelCard';  // Import the new HotelCard component

const API_BASE_URL = 'http://localhost:5000/api/admin';

const CityDetail = () => {
  const [spotData, setSpotData] = useState(null);
  const [hotelData, setHotelData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { city, spotId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpotData = async () => {
      if (!city || !spotId) {
        setError('City or Spot ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/spots/${encodeURIComponent(city)}`);
        console.log('API Response:', response.data);

        if (response.data && response.data.nearbyPlaces && response.data.nearbyPlaces.length > 0) {
          const place = response.data.nearbyPlaces[0];
          setSpotData({
            ...place,
            city: response.data.city,
            latitude: place.latitude || 0,
            longitude: place.longitude || 0
          });
        } else {
          setError('Spot not found');
        }
      } catch (err) {
        console.error('Error fetching spot data:', err);
        setError('Failed to fetch spot data');
      }
    };

    const fetchHotelData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/accommodations`);
        console.log('Hotel Data Response:', response.data);

        if (response.data && Array.isArray(response.data)) {
          setHotelData(response.data);
        } else {
          setError('No hotels available');
        }
      } catch (err) {
        console.error('Error fetching hotel data:', err);
        setError('Failed to fetch hotel data');
      }
    };

    // Fetch both the spot and hotel data concurrently
    const fetchData = async () => {
      await Promise.all([fetchSpotData(), fetchHotelData()]);
      setIsLoading(false); // Set loading to false after both fetches are completed
    };

    fetchData();
  }, [city, spotId]);  // Dependencies to ensure the effect runs when either 'city' or 'spotId' changes

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Check if spotData or hotelData are missing
  if (!spotData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h1>
          <p className="text-gray-700 mb-4">The requested spot could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!hotelData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Hotels Available</h1>
          <p className="text-gray-700 mb-4">There are no hotels available near this spot.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HeroSection name={spotData?.name} city={spotData?.city} picture={spotData?.picture} />
        <Highlights />
        <Description description={spotData?.description} location={spotData?.location} />
        <Activity />
        
        {/* Nearby Hotels Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-semibold mb-6">Nearby Hotels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotelData.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />  
            ))}
          </div>
        </section>

        {/* Map Section */}
        <Map 
          name={spotData?.name}
          latitude={spotData?.latitude} 
          longitude={spotData?.longitude}
        />
      </main>
    </div>
  );
};

export default CityDetail;
