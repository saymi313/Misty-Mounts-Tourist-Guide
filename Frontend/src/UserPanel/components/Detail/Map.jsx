import React from 'react';

const Map = ({ name, latitude, longitude }) => {
  // Default coordinates if not provided
  const lat = latitude || 34.3333;
  const lng = longitude || 73.1994;
  
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=13`;

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-semibold mb-6">Map of {name}</h2>
      <div className="w-full h-[450px] rounded-lg overflow-hidden shadow-md">
        <iframe
          title={`Map of ${name}`}
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
};

export default Map;

