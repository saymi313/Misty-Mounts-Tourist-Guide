import React from 'react';

const AboutSection = ({ description }) => {
  return (
    <section className="px-8 py-6">
      <h2 className="text-2xl font-bold mb-4">About the place</h2>
      <p className="text-gray-700 leading-relaxed">
        {description}
      </p>
    </section>
  );
};

export default AboutSection;
