import React from 'react';

const HeroSection = () => {
  return (
    <section className="text-center py-8">
      <h1 className="text-3xl font-bold">Vintage Double Decker Bus Tour & Thames River Cruise</h1>
      <p className="text-gray-600">Gothenburg • ★★★★☆ (348 reviews)</p>
      <img src="/images/hero.jpg" alt="Tour Hero" className="w-full h-96 object-cover my-4" />
      <div className="flex space-x-4 justify-center">
        <img src="/images/thumb1.jpg" alt="Thumbnail 1" className="w-20 h-20 object-cover" />
        <img src="/images/thumb2.jpg" alt="Thumbnail 2" className="w-20 h-20 object-cover" />
        {/* Add more thumbnails as needed */}
      </div>
    </section>
  );
};

export default HeroSection;
