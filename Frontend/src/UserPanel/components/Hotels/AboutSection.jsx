import React from 'react';
import { Tile, Eyebrow } from '../bento/tiles';

const AboutSection = ({ description }) => {
  return (
    <Tile pad="p-6 sm:p-8" glow="green">
      <Eyebrow>Overview</Eyebrow>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        About this <span className="text-lime-400">place</span>
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-white/70">{description}</p>
    </Tile>
  );
};

export default AboutSection;
