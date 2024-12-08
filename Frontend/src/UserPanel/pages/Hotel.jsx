import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Hotels/Header';
import HeroSection from '../components/Hotels/HeroSection';
import AboutSection from '../components/Hotels/AboutSection';
import DetailsComponent from '../components/Hotels/DetailsComponent';
import BookingComponent from '../components/Hotels/BookingComponent';
const API_BASE_URL = 'http://localhost:5000/api/admin';
const Hotel = () => {
  const { id } = useParams(); // Capture the hotel id from the URL
  const [hotelData, setHotelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/accommodations/${id}`);  // API call
        setHotelData(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching hotel data:', err);
        setError('Failed to fetch hotel data');
        setIsLoading(false);
      }
    };

    fetchHotelData();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Header />
      <HeroSection name={hotelData.name} picture={hotelData.picture} />
      <AboutSection description={hotelData.description} />
      <DetailsComponent hotel={hotelData} />
      <BookingComponent price={hotelData.price} name={hotelData.name} />
    </div>
  );
};

export default Hotel;
