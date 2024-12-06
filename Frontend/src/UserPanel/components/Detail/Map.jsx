import React from 'react';

const Map = () => {
  return (
    <section className="px-8 py-4">
      <h2 className="text-2xl font-bold mb-4">Map</h2>
      <iframe
        title="Google Map"
        src="https://www.google.com/maps/embed?...your-map-url"
        width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </section>
  );
};

export default Map;
