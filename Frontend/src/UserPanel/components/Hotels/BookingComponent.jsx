import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ShieldCheck, Star } from 'lucide-react';
import { Tile, Btn } from '../bento/tiles';
import { formatPKR } from '../../../utils/currency';

const BookingComponent = ({ hotel = {} }) => {
  const navigate = useNavigate();
  const { name, price, picture, type, rating } = hotel;
  const isFood = type === 'food';
  const fee = 1500;

  const handleBooking = () => {
    navigate('/payment', {
      state: {
        subtotal: price,
        fee,
        hotelName: name,
        hotelImage: picture,
      },
    });
  };

  return (
    <div className="lg:sticky lg:top-24">
      <Tile glow="lime" pad="p-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-4xl font-extrabold tracking-tight text-lime-400">{formatPKR(price)}</span>
            <span className="text-sm font-medium text-white/50">{isFood ? ' / person' : ' / night'}</span>
          </div>
          {rating && (
            <span className="flex items-center gap-1 text-sm font-bold text-white">
              <Star className="h-4 w-4 fill-lime-400 text-lime-400" /> {rating}
            </span>
          )}
        </div>

        <div className="mt-5 space-y-2 rounded-2xl border border-white/[0.07] bg-night-700 p-4 text-sm">
          <div className="flex justify-between text-white/60">
            <span>{isFood ? 'Table reservation' : 'Subtotal (1 night)'}</span>
            <span className="font-semibold text-white">{formatPKR(price)}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Service fee</span>
            <span className="font-semibold text-white">{formatPKR(fee)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-white">
            <span>Total</span>
            <span className="text-lime-400">{formatPKR(price + fee)}</span>
          </div>
        </div>

        <Btn onClick={handleBooking} className="mt-5 w-full">
          <CalendarCheck className="h-4 w-4" /> {isFood ? 'Reserve a table' : 'Book now'}
        </Btn>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50">
          <ShieldCheck className="h-3.5 w-3.5 text-lime-400" /> Free cancellation up to 48h before
        </p>
      </Tile>
    </div>
  );
};

export default BookingComponent;
