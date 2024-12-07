import React from 'react';

const Map = () => {
  return (
    <div className="h-64 bg-gray-300 flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{backgroundImage: "url('/placeholder.svg?height=256&width=768')"}}
      ></div>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <p className="text-white text-lg font-semibold">Interactive Map Coming Soon</p>
      </div>
    </div>
  );
};

export default Map;

