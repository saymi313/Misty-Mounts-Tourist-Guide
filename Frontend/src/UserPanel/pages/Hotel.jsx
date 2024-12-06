import React from 'react';
import Header from '../components/Hotels/Header';
import HeroSection from '../components/Hotels/HeroSection';
import AboutSection from '../components/Hotels/AboutSection';
import DetailsComponent from '../components/Hotels/DetailsComponent';
import BookingComponent from '../components/Hotels/BookingComponent';

const Hotel = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <AboutSection />
      <DetailsComponent />
      <BookingComponent />
    </div>
  );
};

export default Hotel;
