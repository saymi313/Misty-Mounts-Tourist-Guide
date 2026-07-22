import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Navbar from "../components/Navbar";
import PaymentForm from '../components/Pay/PaymentForm';
import Footer from '../components/Home/Footer';
import { Eyebrow, Btn } from '../components/bento/tiles';

const Steps = () => (
  <ol className="mx-auto mb-10 flex max-w-md items-center justify-center gap-2 text-sm">
    {['Select', 'Details', 'Confirm'].map((label, i) => (
      <React.Fragment key={label}>
        <li className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i <= 1 ? 'bg-lime-400 text-night-950' : 'border border-white/12 bg-night-800 text-white/50'
            }`}
          >
            {i < 1 ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
          </span>
          <span className={i <= 1 ? 'font-semibold text-white' : 'text-white/50'}>{label}</span>
        </li>
        {i < 2 && <span className={`h-px w-8 ${i < 1 ? 'bg-lime-400/50' : 'bg-white/15'}`} />}
      </React.Fragment>
    ))}
  </ol>
);

const Payment = () => {
  const location = useLocation();
  const { subtotal, fee, hotelName, hotelImage, accId, city } = location.state || {};

  if (subtotal == null) {
    return (
      <div className="min-h-screen bg-night-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">No booking selected</h1>
          <p className="mt-3 text-white/60">Pick a stay first, then return here to book.</p>
          <Link to="/destinations" className="mt-6 inline-block">
            <Btn>Browse destinations</Btn>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <Eyebrow className="justify-center">Almost there</Eyebrow>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Complete your <span className="text-lime-400">booking</span>
          </h1>
        </div>
        <div className="mt-8"><Steps /></div>
        <PaymentForm subtotal={subtotal} fee={fee} hotelName={hotelName} hotelImage={hotelImage} accId={accId} city={city} />
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
