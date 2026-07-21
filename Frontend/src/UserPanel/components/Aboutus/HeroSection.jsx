import React from 'react';
import { img } from '../../../data/mockData';

const HeroSection = () => {
  return (
    <div className="relative h-[46vh] min-h-[340px] overflow-hidden">
      <img src={img('about-hero', 1600, 700)} alt="Northern Pakistan" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/50 to-abyss-900/30" />
      <div className="absolute inset-0 mx-auto flex max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow text-glacier-300">Our story</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-frost-50 sm:text-6xl text-balance">
          Built by locals,{" "}
          <span className="font-accent font-normal text-glacier-300">for travellers.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-frost-200/90">
          We started Misty Mounts to share the north the way locals know it — beyond the
          postcards, with the people, routes, and hidden corners that make it unforgettable.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
