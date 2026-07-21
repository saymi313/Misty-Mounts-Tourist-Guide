import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ShieldCheck, Star } from 'lucide-react';

const BookingComponent = ({ hotel = {} }) => {
  const navigate = useNavigate();
  const { name, price, picture, type, rating } = hotel;
  const isFood = type === 'food';
  const fee = 9;

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
    <div className="card-surface p-6 lg:sticky lg:top-24">
      <div className="flex items-end justify-between">
        <div>
          <span className="font-display text-3xl font-semibold text-abyss-900 dark:text-frost-50">${price}</span>
          <span className="text-sm text-frost-500 dark:text-frost-400">{isFood ? ' / person' : ' / night'}</span>
        </div>
        {rating && (
          <span className="flex items-center gap-1 text-sm font-medium text-abyss-800 dark:text-frost-100">
            <Star className="h-4 w-4 fill-glacier-400 text-glacier-400" /> {rating}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-2 rounded-2xl bg-frost-100 p-4 text-sm dark:bg-abyss-800">
        <div className="flex justify-between text-frost-600 dark:text-frost-300">
          <span>{isFood ? 'Table reservation' : 'Subtotal (1 night)'}</span>
          <span className="font-medium text-abyss-900 dark:text-frost-50">${price}</span>
        </div>
        <div className="flex justify-between text-frost-600 dark:text-frost-300">
          <span>Service fee</span>
          <span className="font-medium text-abyss-900 dark:text-frost-50">${fee}</span>
        </div>
        <div className="flex justify-between border-t border-abyss-900/10 pt-2 font-semibold text-abyss-900 dark:border-frost-50/12 dark:text-frost-50">
          <span>Total</span>
          <span>${price + fee}</span>
        </div>
      </div>

      <button onClick={handleBooking} className="btn-primary mt-5 w-full">
        <CalendarCheck className="h-4 w-4" /> {isFood ? 'Reserve a table' : 'Book now'}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-frost-500 dark:text-frost-400">
        <ShieldCheck className="h-3.5 w-3.5 text-glacier-700 dark:text-glacier-300" /> Free cancellation up to 48h before
      </p>
    </div>
  );
};

export default BookingComponent;
