import React from 'react';
import Navbar from '../components/Pay/Navbar';
import PaymentForm from '../components/Pay/PaymentForm';

const Payment = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Complete Your Booking</h1>
        <PaymentForm
          subtotal={165}
          fee={9}
          hotelName="HOTEL TITLE"
          hotelImage="/placeholder.svg?height=400&width=600"
        />
      </div>
    </div>
  );
};

export default Payment;

