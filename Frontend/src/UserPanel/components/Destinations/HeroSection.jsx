import React from 'react';

const HeroSection = ({ title, subtitle, backgroundImage }) => {
  return (
    <div className="relative h-screen bg-cover bg-center" style={{ backgroundImage }}>
      <div className="absolute inset-0 bg-abyss-950/40 flex flex-col justify-center items-center text-frost-50 text-center">
        <h1 className="text-5xl font-bold">{title}</h1>
        <p className="mt-4 max-w-2xl">{subtitle}</p>
      </div>
    </div>
  );
};

export default HeroSection;
