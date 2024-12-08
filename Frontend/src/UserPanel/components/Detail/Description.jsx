import React from 'react';

const Description = ({ description, location }) => {
  return (
    <section className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Description</h2>
      <p className="text-gray-700 leading-7 mb-4">{description}</p>
      <h3 className="text-xl font-semibold mb-2">Location</h3>
      <p className="text-gray-700">{location}</p>
    </section>
  );
};

export default Description;

