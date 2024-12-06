import React from 'react';

const HeroSection = () => {
  return (
    <section className="px-8 py-6">
      <h1 className="text-3xl font-bold text-center">Moon Restaurant</h1>
      <p className="text-gray-600 text-center mb-6">Galle, Sri Lanka</p>
      <div className="grid grid-cols-2 gap-4">
        <img src="/images/main-image.jpg" alt="Main" className="col-span-2 w-full h-80 object-cover rounded-lg" />
        <img src="/images/room1.jpg" alt="Room 1" className="w-full h-40 object-cover rounded-lg" />
        <img src="/images/room2.jpg" alt="Room 2" className="w-full h-40 object-cover rounded-lg" />
      </div>
    </section>
  );
};

export default HeroSection;
