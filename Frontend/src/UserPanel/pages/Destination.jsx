import React from 'react';
import Navbar from '../components/Destinations/Navbar';
import HeroSection from '../components/Destinations/HeroSection';
import SearchBar from '../components/Destinations/SearchBar';
import CityCard from '../components/Destinations/CityCard';
import Pagination from '../components/Destinations/Pagination';

const Destination = () => {
  const destinations = [
    { id: 1, title: 'Alaska: Westminster to Greenwich River Thames', duration: '2 hours', transport: 'Transport Facility', familyPlan: 'Family Plan' },
    { id: 2, title: 'Alaska: Vintage Double Decker Bus Tour & Thames', duration: '2 hours', transport: 'Transport Facility', familyPlan: 'Family Plan' },
    { id: 3, title: 'Alaska: Magic of London Tour with Afternoon Tea', duration: '2 hours', transport: 'Transport Facility', familyPlan: 'Family Plan' },
    { id: 4, title: 'Alaska: Magic of London Tour with Afternoon Tea', duration: '2 hours', transport: 'Transport Facility', familyPlan: 'Family Plan' },
  ];

  return (
    <div>
      <Navbar />
      <HeroSection
        title="Welcome to Northern Pakistan"
        subtitle="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint."
        backgroundImage="url('/path-to-background-image.jpg')"
      />
      <SearchBar placeholder="Search For A Destination" />
      <section className="px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-6">Explore Popular Cities</h2>
        <p className="text-center text-gray-500 mb-12">
          Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.
        </p>
        <div className="flex justify-center space-x-4 mb-8">
          {['New York', 'California', 'Alaska', 'Sidney', 'Dubai', 'London', 'Tokyo', 'Delhi'].map((city, index) => (
            <button
              key={index}
              className={`px-4 py-2 border rounded-full ${city === 'Alaska' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {city}
            </button>
          ))}
        </div>
        <div className="relative bg-cover bg-center h-96 rounded-md mb-12" style={{ backgroundImage: "url('/path-to-alaska-image.jpg')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white">
            <h3 className="text-4xl font-bold">Alaska</h3>
            <p className="text-center mt-4 max-w-xl">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat.
            </p>
            <div className="flex mt-6 space-x-4">
              {['Public Transportations', 'Nature & Adventure', 'Private Transportations', 'Business Tours', 'Local Visit'].map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <CityCard key={destination.id} {...destination} />
          ))}
        </div>
        <Pagination />
      </section>
    </div>
  );
};

export default Destination;
