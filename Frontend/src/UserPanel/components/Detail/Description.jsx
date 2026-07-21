import React from 'react';
import { BookOpen } from 'lucide-react';

const Description = ({ description, location }) => {
  return (
    <section>
      <p className="eyebrow">
        <BookOpen className="h-3.5 w-3.5" /> About this place
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50 sm:text-3xl">
        The story of the place
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-frost-600 dark:text-frost-300 text-balance">{description}</p>
      <p className="mt-4 leading-relaxed text-frost-600 dark:text-frost-300">
        Historical and cultural context is drawn from open sources such as Wikipedia and
        curated notes from local guides who live in {location?.split(',').pop()?.trim() || 'the region'}.
      </p>
    </section>
  );
};

export default Description;
