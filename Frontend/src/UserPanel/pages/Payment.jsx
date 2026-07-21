import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Navbar from "../components/Navbar";
import PaymentForm from '../components/Pay/PaymentForm';
import Footer from '../components/Home/Footer';

const Steps = () => (
  <ol className="mx-auto mb-10 flex max-w-md items-center justify-center gap-2 text-sm">
    {['Select', 'Details', 'Confirm'].map((label, i) => (
      <React.Fragment key={label}>
        <li className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i <= 1 ? 'bg-glacier-400 text-abyss-950' : 'bg-frost-200 text-frost-500 dark:bg-abyss-800 dark:text-frost-400'
            }`}
          >
            {i < 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span className={i <= 1 ? 'font-medium text-abyss-900 dark:text-frost-50' : 'text-frost-500 dark:text-frost-400'}>{label}</span>
        </li>
        {i < 2 && <span className="h-px w-8 bg-abyss-900/15 dark:bg-frost-50/15" />}
      </React.Fragment>
    ))}
  </ol>
);

const Payment = () => {
  const location = useLocation();
  const { subtotal, fee, hotelName, hotelImage } = location.state || {};

  if (subtotal == null) {
    return (
      <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">No booking selected</h1>
          <p className="mt-3 text-frost-600 dark:text-frost-300">Pick a stay first, then return here to book.</p>
          <Link to="/destinations" className="btn-primary mt-6">Browse destinations</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="eyebrow justify-center">Almost there</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-abyss-900 dark:text-frost-50 sm:text-4xl">
            Complete your booking
          </h1>
        </div>
        <div className="mt-8"><Steps /></div>
        <PaymentForm subtotal={subtotal} fee={fee} hotelName={hotelName} hotelImage={hotelImage} />
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
