import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Utensils, BedDouble, ArrowRight } from 'lucide-react';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const isFood = hotel.type === 'food';

  return (
    <button
      onClick={() => navigate(`/accommodations/${hotel._id}`)}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-abyss-900 text-left shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10 transition-all duration-300 ease-editorial hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative overflow-hidden">
        <img
          src={hotel.picture}
          alt={hotel.name}
          className="h-44 w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 dark:bg-abyss-900/95 px-2.5 py-1 text-xs font-semibold text-abyss-900 dark:text-frost-50 shadow-sm backdrop-blur">
          {isFood ? <Utensils className="h-3 w-3" /> : <BedDouble className="h-3 w-3" />}
          {isFood ? 'Food' : 'Stay'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-abyss-900 dark:text-frost-50">{hotel.name}</h3>
          {hotel.rating && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-abyss-900 dark:text-frost-50">
              <Star className="h-3.5 w-3.5 fill-glacier-400 text-glacier-400" /> {hotel.rating}
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-frost-600 dark:text-frost-300">{hotel.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-frost-500 dark:text-frost-400">
            <span className="font-display text-lg font-semibold text-abyss-900 dark:text-frost-50">${hotel.price}</span>
            {isFood ? ' / person' : ' / night'}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-glacier-700 transition-colors group-hover:text-glacier-900 dark:text-glacier-300 dark:group-hover:text-glacier-100">
            View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
};

export default HotelCard;
