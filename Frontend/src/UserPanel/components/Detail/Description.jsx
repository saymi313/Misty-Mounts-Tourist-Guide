import React from 'react';
import { BookOpen } from 'lucide-react';
import { Tile, Eyebrow } from '../bento/tiles';

const Description = ({ description, location, className = '' }) => {
  return (
    <Tile glow="green" pad="p-6 sm:p-8" className={`h-full ${className}`}>
      <Eyebrow><BookOpen className="h-3.5 w-3.5" /> About this place</Eyebrow>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        The story of the <span className="text-lime-400">place</span>
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-white/70 text-balance">{description}</p>
      <p className="mt-4 leading-relaxed text-white/50">
        Historical and cultural context is drawn from open sources such as Wikipedia and
        curated notes from local guides who live in {location?.split(',').pop()?.trim() || 'the region'}.
      </p>
    </Tile>
  );
};

export default Description;
