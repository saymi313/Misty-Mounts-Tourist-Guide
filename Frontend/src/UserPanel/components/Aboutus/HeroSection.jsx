import React from 'react';

const HeroSection = () => {
  return (
    <div className="relative bg-cover bg-center h-96" style={{backgroundImage: "url('/placeholder.svg?height=1080&width=1920')"}}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Discover the World with Us
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Our mission is to inspire and empower travelers to explore the beauty of our planet, creating unforgettable experiences and fostering cultural understanding.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;

