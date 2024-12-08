import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar";
import HeroSection from '../components/Destinations/HeroSection';
import SearchBar from '../components/Destinations/SearchBar';
import CityCard from '../components/Destinations/CityCard';
import Pagination from '../components/Destinations/Pagination';

const API_BASE_URL = 'http://localhost:5000/api/admin';

const Destination = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/cities`, { withCredentials: true });
        console.log('Cities response:', response.data); // Log the response
        if (Array.isArray(response.data)) {
          setCities(response.data);
          if (response.data.length > 0) {
            setSelectedCity(response.data[0]);
          }
        } else {
          throw new Error('Received invalid data for cities');
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setError('Failed to fetch cities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (selectedCity) {
        setIsLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/spots/${selectedCity}`, { withCredentials: true });
          console.log('Nearby places response:', response.data); // Log the response
          setNearbyPlaces(response.data.nearbyPlaces || []);
        } catch (error) {
          console.error('Error fetching nearby places:', error);
          setError('Failed to fetch nearby places. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchNearbyPlaces();
  }, [selectedCity]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="spinner-border text-indigo-900" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 flex justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12" />
        </svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className='bg-blue-50'>
      <div 
        className='h-screen w-full ' 
        style={{ 
          backgroundImage: "url('hero.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          height: '100vh', // Ensure full screen height
        }}
      >
        <Navbar />
        <HeroSection  
          title="Welcome to Northern Pakistan"
          subtitle="Explore the beauty of Northern Pakistan"
        />
      </div>
      
      <SearchBar placeholder="Search For A Destination" />
      
      <section className="px-4 sm:px-8 py-12 my-12 ">
        <h2 className="text-3xl font-bold text-center mb-6">Explore Popular Cities</h2>
        <p className="text-center text-gray-500 mb-12">
          Discover the hidden gems of Northern Pakistan
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {cities.map((city, index) => (
            <button
              key={index}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 border rounded-full transition-all duration-300 ease-in-out transform ${
                selectedCity === city
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {selectedCity && (
          <div 
            className="relative bg-cover bg-center h-96 rounded-md mb-12" 
            style={{ backgroundImage: `url('${selectedCity}.jpg')` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white">
              <h3 className="text-4xl font-bold text-shadow-md">{selectedCity}</h3>
              <p className="text-center mt-4 max-w-xl text-shadow-md">
                Explore the beauty and culture of {selectedCity}
              </p>
            </div>
          </div>
        )}

        <h3 className="text-4xl font-bold">Popular Hidden Places</h3>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nearbyPlaces.map((place) => (
            <CityCard key={place._id} {...place} />
          ))}
        </div>

        <Pagination />
      </section>
    </div>
  );
};

export default Destination;
