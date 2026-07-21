import React from 'react';

const AboutSection = ({ description }) => {
  return (
    <section>
      <p className="eyebrow">Overview</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">About this place</h2>
      <p className="mt-4 text-lg leading-relaxed text-frost-600 dark:text-frost-300 text-balance">{description}</p>
    </section>
  );
};

export default AboutSection;
