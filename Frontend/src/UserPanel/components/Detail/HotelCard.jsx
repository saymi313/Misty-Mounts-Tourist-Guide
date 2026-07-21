import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, BedDouble, ArrowRight } from 'lucide-react';
import { Stars } from '../bento/tiles';
import { formatPKR } from '../../../utils/currency';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const isFood = hotel.type === 'food';

  return (
    <button
      onClick={() => navigate(`/accommodations/${hotel._id}`)}
      className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-night-800 text-left transition-all duration-300 ease-editorial hover:-translate-y-1 hover:border-lime-400/40"
    >
      <div className="relative overflow-hidden">
        <img
          src={hotel.picture}
          alt={hotel.name}
          className="h-44 w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-lime-400 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-night-950">
          {isFood ? <Utensils className="h-3 w-3" /> : <BedDouble className="h-3 w-3" />}
          {isFood ? 'Food' : 'Stay'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-extrabold text-white">{hotel.name}</h3>
          {hotel.rating && (
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-white">
              <Stars value={Math.round(hotel.rating)} /> {hotel.rating}
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-white/60">{hotel.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-white/50">
            <span className="text-lg font-extrabold text-white">{formatPKR(hotel.price)}</span>
            {isFood ? ' / person' : ' / night'}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-lime-400 transition-colors group-hover:text-lime-300">
            View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
};

export default HotelCard;
