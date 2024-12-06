import React from 'react';

const BookingComponent = () => {
  return (
    <section className="px-8 py-6">
      <div className="border rounded-lg shadow-lg p-6 text-center">
        <p className="text-2xl font-bold text-gray-700">Start Booking</p>
        <p className="text-3xl font-bold text-green-600 mt-2">$200</p>
        <p className="text-gray-600 mb-4">per Day</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Book Now!</button>
      </div>
    </section>
  );
};

export default BookingComponent;
