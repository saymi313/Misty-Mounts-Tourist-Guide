import React from 'react';

const HeroSection = ({ name, city, picture }) => {
  return (
    <section className="text-center py-8">
      <h1 className="text-3xl font-bold">{name}</h1>
      <p className="text-gray-600">{city}</p>
      <img src={picture} alt={name} className="w-full h-96 object-cover my-4 rounded-lg" />
    </section>
  );
};

export default HeroSection;

