import React from 'react';

const HeroSection = ({ name, picture }) => {
  return (
    <section className="px-8 py-6">
      <h1 className="text-3xl font-bold text-center  my-2">{name}</h1>
      <div className="grid grid-cols-1">
        <img
          src={picture} 
          alt={name} 
          className="w-full h-80 object-cover rounded-lg"
        />
      </div>
    </section>
  );
};

export default HeroSection;
