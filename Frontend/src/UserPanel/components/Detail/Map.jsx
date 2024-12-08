import React from 'react';

const Map = ({ name, latitude, longitude }) => {
  const zoom = 15;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01}%2C${latitude-0.01}%2C${longitude+0.01}%2C${latitude+0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Map of {name}</h2>
      <iframe
        title="map"
        src={mapUrl}
        width="600"
        height="450"
      />
    </div>
  );
};

export default Map;

