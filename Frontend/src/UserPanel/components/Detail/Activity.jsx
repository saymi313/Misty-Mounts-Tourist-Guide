import React from 'react';
import { Compass, Check } from 'lucide-react';
import { Tile, Eyebrow } from '../bento/tiles';

const Activity = ({ activities, className = '' }) => {
  const list =
    activities && activities.length
      ? activities
      : ['Guided walks', 'Photography', 'Local cuisine', 'Scenic drives'];

  return (
    <Tile pad="p-6 sm:p-7" className={`h-full ${className}`}>
      <Eyebrow><Compass className="h-3.5 w-3.5" /> Things to do</Eyebrow>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        Ways to spend your <span className="text-lime-400">day</span>
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((activity, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-night-700/60 p-4 transition-colors hover:border-lime-400/40"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
              <Check className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-white">{activity}</span>
          </div>
        ))}
      </div>
    </Tile>
  );
};

export default Activity;
