import React, { useState } from 'react';
import { Calendar, CreditCard, Check, MapPin, ShieldCheck } from 'lucide-react';
import { createPayment } from '../../../data/mockApi';

const inputCls =
  'mt-1 block w-full rounded-xl border border-abyss-900/12 bg-white px-4 py-3 text-sm text-abyss-900 placeholder-frost-400 transition-all focus:border-glacier-400 focus:outline-none focus:ring-2 focus:ring-glacier-400/20 dark:border-frost-50/15 dark:bg-abyss-800 dark:text-frost-50';
const labelCls = 'block text-sm font-medium text-abyss-800 dark:text-frost-100';

const PaymentForm = ({ subtotal = 0, fee = 0, hotelName, hotelImage }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', date: '', numberOfDays: '1', hasPromoCode: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const nights = Math.max(1, parseInt(formData.numberOfDays, 10) || 1);
  const roomTotal = subtotal * nights;
  const totalAmount = roomTotal + fee;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await createPayment({ ...formData, subtotal, fee, totalAmount, hotelName, numberOfDays: nights });
      setConfirmation(res.data);
    } catch {
      setError('Unable to process the booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card-surface overflow-hidden text-center">
          <div className="bg-abyss-800 px-8 py-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-glacier-400 text-abyss-950">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold text-frost-50">Booking confirmed!</h2>
            <p className="mt-2 text-sm text-frost-300">
              A confirmation has been sent to {formData.email || 'your email'}.
            </p>
          </div>
          <div className="space-y-3 p-8 text-sm">
            <Row label="Booking reference" value={confirmation.bookingId} strong />
            <Row label="Stay" value={hotelName} />
            <Row label="Nights" value={nights} />
            <Row label="Total paid" value={`$${totalAmount}`} strong />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      {/* Form */}
      <div className="card-surface p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-abyss-900 dark:text-frost-50">Guest details</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelCls}>First name</label>
              <input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} className={inputCls} />
            </div>
            <div>
              <label htmlFor="lastName" className={labelCls}>Last name</label>
              <input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>Email</label>
            <input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className={inputCls} />
          </div>
          <div>
            <label htmlFor="phone" className={labelCls}>Phone</label>
            <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className={labelCls}>Check-in date</label>
              <div className="relative">
                <input id="date" name="date" type="date" required value={formData.date} onChange={handleInputChange} className={`${inputCls} pl-11`} />
                <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
              </div>
            </div>
            <div>
              <label htmlFor="numberOfDays" className={labelCls}>Nights</label>
              <input id="numberOfDays" name="numberOfDays" type="number" min="1" required value={formData.numberOfDays} onChange={handleInputChange} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-frost-600 dark:text-frost-300">
            <input type="checkbox" name="hasPromoCode" checked={formData.hasPromoCode} onChange={handleInputChange} className="h-4 w-4 rounded border-abyss-900/12 text-glacier-700 focus:ring-glacier-400 dark:border-frost-50/15 dark:text-glacier-300" />
            I have a promo code
          </label>

          {error && <p className="text-sm text-clay-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-abyss-950/40 border-t-abyss-950" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" /> Pay ${totalAmount}
              </>
            )}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-frost-500 dark:text-frost-400">
            <ShieldCheck className="h-3.5 w-3.5 text-glacier-700 dark:text-glacier-300" /> Secure checkout · this is a demo, no real charge
          </p>
        </form>
      </div>

      {/* Summary */}
      <div className="card-surface h-fit overflow-hidden lg:sticky lg:top-24">
        {hotelImage && <img src={hotelImage} alt={hotelName} className="h-40 w-full object-cover" />}
        <div className="p-6">
          <h3 className="font-display text-lg font-semibold text-abyss-900 dark:text-frost-50">{hotelName}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-frost-500 dark:text-frost-400">
            <MapPin className="h-3.5 w-3.5" /> Northern Pakistan
          </p>
          <div className="mt-5 space-y-2 border-t border-abyss-900/8 pt-5 text-sm dark:border-frost-50/8">
            <Row label={`$${subtotal} × ${nights} night${nights > 1 ? 's' : ''}`} value={`$${roomTotal}`} />
            <Row label="Service fee" value={`$${fee}`} />
            <div className="flex justify-between border-t border-abyss-900/10 pt-3 font-display text-lg font-semibold text-abyss-900 dark:border-frost-50/12 dark:text-frost-50">
              <span>Total</span>
              <span>${totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, strong }) => (
  <div className="flex justify-between">
    <span className="text-frost-500 dark:text-frost-400">{label}</span>
    <span className={strong ? 'font-semibold text-abyss-900 dark:text-frost-50' : 'font-medium text-abyss-900 dark:text-frost-50'}>{value}</span>
  </div>
);

export default PaymentForm;
