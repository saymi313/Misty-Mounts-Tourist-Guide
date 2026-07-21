import React from 'react';
import { Compass, Check } from 'lucide-react';

const Activity = ({ activities }) => {
  const list =
    activities && activities.length
      ? activities
      : ['Guided walks', 'Photography', 'Local cuisine', 'Scenic drives'];

  return (
    <section className="mt-12">
      <p className="eyebrow">
        <Compass className="h-3.5 w-3.5" /> Things to do
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50 sm:text-3xl">
        Ways to spend your day
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((activity, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-abyss-900 p-4 shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-glacier-500/15 text-glacier-700 dark:bg-glacier-400/15 dark:text-glacier-300">
              <Check className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-abyss-900 dark:text-frost-50">{activity}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Activity;
