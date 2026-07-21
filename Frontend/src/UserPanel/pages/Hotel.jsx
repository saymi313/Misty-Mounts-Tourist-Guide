import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAccommodationById } from '../../data/mockApi';
import Navbar from "../components/Navbar";
import HeroSection from '../components/Hotels/HeroSection';
import AboutSection from '../components/Hotels/AboutSection';
import DetailsComponent from '../components/Hotels/DetailsComponent';
import BookingComponent from '../components/Hotels/BookingComponent';
import Footer from '../components/Home/Footer';

const Hotel = () => {
  const { id } = useParams();
  const [hotelData, setHotelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAccommodationById(id)
      .then((data) => setHotelData(data))
      .catch(() => setError('Failed to fetch this place.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-frost-50 dark:bg-abyss-950">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-abyss-900/15 border-t-glacier-500" />
      </div>
    );
  }

  if (error || !hotelData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-frost-50 px-6 dark:bg-abyss-950">
        <div className="card-surface max-w-md p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">Not found</h1>
          <p className="mt-3 text-frost-600 dark:text-frost-300">{error || 'This place is unavailable.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection hotel={hotelData} />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <AboutSection description={hotelData.description} />
            <DetailsComponent hotel={hotelData} />
          </div>
          <aside>
            <BookingComponent hotel={hotelData} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Hotel;
