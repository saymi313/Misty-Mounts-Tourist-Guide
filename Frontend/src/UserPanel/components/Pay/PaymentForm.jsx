import React, { useState } from 'react';
import { Calendar, CreditCard, Check, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { createPayment } from '../../../data/mockApi';
import { Tile, Btn, inputCls } from '../bento/tiles';
import {
  required, email as emailRule, phone as phoneRule, integer, min, notPast,
  validate, hasErrors, todayStr,
} from '../../../utils/validation';
import { formatPKR } from '../../../utils/currency';
import { addBooking } from '../../../utils/bookingsStore';
import { LIVE } from '../../../data/api';

const labelCls = 'mb-1.5 block text-sm font-semibold text-white/70';
const inputErr = '!border-rose-400/60 focus:!border-rose-400/60 focus:!ring-rose-400/15';
const errNote = 'mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400';

const PaymentForm = ({ subtotal = 0, fee = 0, hotelName, hotelImage, accId, city }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', date: '', numberOfDays: '1', hasPromoCode: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const nights = Math.max(1, parseInt(formData.numberOfDays, 10) || 1);
  const roomTotal = subtotal * nights;
  const totalAmount = roomTotal + fee;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const found = validate(formData, {
      firstName: [required('First name is required')],
      lastName: [required('Last name is required')],
      email: [required('Email is required'), emailRule()],
      phone: [required('Phone number is required'), phoneRule()],
      date: [required('Pick a check-in date'), notPast('Check-in cannot be in the past')],
      numberOfDays: [required('Enter number of nights'), integer('Whole nights only'), min(1, 'At least 1 night')],
    });
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }

    setLoading(true);
    try {
      const res = await createPayment({
        ...formData, subtotal, fee, totalAmount, hotelName, numberOfDays: nights,
        accId, city, hotelImage,
      });
      // Record the booking so it shows in "My bookings" — the real server row
      // when live, an optimistic local one otherwise.
      addBooking(
        LIVE && res.data.booking
          ? res.data.booking
          : {
              _id: `mb-${res.data.bookingId}`,
              accId: accId || "",
              hotel: hotelName || "Your stay",
              city: city || "Northern Pakistan",
              image: hotelImage || "",
              checkIn: formData.date,
              nights,
              guests: 1,
              amount: totalAmount,
              status: "Upcoming",
              bookedOn: todayStr(),
              ref: res.data.bookingId,
            }
      );
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
        <Tile glow="lime" pad="p-0" className="overflow-hidden text-center">
          <div className="border-b border-white/[0.07] bg-night-700 px-8 py-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-400 text-night-950">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-white">Booking confirmed!</h2>
            <p className="mt-2 text-sm text-white/60">
              A confirmation has been sent to {formData.email || 'your email'}.
            </p>
          </div>
          <div className="space-y-3 p-8 text-sm">
            <Row label="Booking reference" value={confirmation.bookingId} strong />
            <Row label="Stay" value={hotelName} />
            <Row label="Nights" value={nights} />
            <Row label="Total paid" value={formatPKR(totalAmount)} accent />
          </div>
        </Tile>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      {/* Form */}
      <Tile pad="p-6 sm:p-8">
        <h2 className="text-xl font-extrabold tracking-tight text-white">Guest details</h2>
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelCls}>First name</label>
              <input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} aria-invalid={!!errors.firstName} className={`${inputCls} ${errors.firstName ? inputErr : ''}`} />
              {errors.firstName && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className={labelCls}>Last name</label>
              <input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} aria-invalid={!!errors.lastName} className={`${inputCls} ${errors.lastName ? inputErr : ''}`} />
              {errors.lastName && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} aria-invalid={!!errors.email} className={`${inputCls} ${errors.email ? inputErr : ''}`} />
            {errors.email && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className={labelCls}>Phone</label>
            <input id="phone" name="phone" type="tel" inputMode="tel" value={formData.phone} onChange={handleInputChange} placeholder="+92 300 1234567" aria-invalid={!!errors.phone} className={`${inputCls} ${errors.phone ? inputErr : ''}`} />
            {errors.phone && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.phone}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className={labelCls}>Check-in date</label>
              <div className="relative">
                <input id="date" name="date" type="date" min={todayStr()} value={formData.date} onChange={handleInputChange} aria-invalid={!!errors.date} className={`${inputCls} pl-11 [color-scheme:dark] ${errors.date ? inputErr : ''}`} />
                <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-400" />
              </div>
              {errors.date && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.date}</p>}
            </div>
            <div>
              <label htmlFor="numberOfDays" className={labelCls}>Nights</label>
              <input id="numberOfDays" name="numberOfDays" type="number" min="1" step="1" inputMode="numeric" value={formData.numberOfDays} onChange={handleInputChange} aria-invalid={!!errors.numberOfDays} className={`${inputCls} ${errors.numberOfDays ? inputErr : ''}`} />
              {errors.numberOfDays && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.numberOfDays}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-white/60">
            <input type="checkbox" name="hasPromoCode" checked={formData.hasPromoCode} onChange={handleInputChange} className="h-4 w-4 rounded border-white/20 bg-night-800 text-lime-400 focus:ring-lime-400/40" />
            I have a promo code
          </label>

          {error && <p className="text-sm font-medium text-rose-400">{error}</p>}

          <Btn type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-night-950/40 border-t-night-950" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" /> Pay {formatPKR(totalAmount)}
              </>
            )}
          </Btn>
          <p className="flex items-center justify-center gap-1.5 text-xs text-white/50">
            <ShieldCheck className="h-3.5 w-3.5 text-lime-400" /> Secure checkout · this is a demo, no real charge
          </p>
        </form>
      </Tile>

      {/* Summary */}
      <div className="h-fit lg:sticky lg:top-24">
        <Tile glow="green" pad="p-0" className="overflow-hidden">
          {hotelImage && <img src={hotelImage} alt={hotelName} className="h-40 w-full object-cover" />}
          <div className="p-6">
            <h3 className="text-lg font-extrabold tracking-tight text-white">{hotelName}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/50">
              <MapPin className="h-3.5 w-3.5 text-lime-400" /> Northern Pakistan
            </p>
            <div className="mt-5 space-y-2 border-t border-white/[0.07] pt-5 text-sm">
              <Row label={`${formatPKR(subtotal)} × ${nights} night${nights > 1 ? 's' : ''}`} value={formatPKR(roomTotal)} />
              <Row label="Service fee" value={formatPKR(fee)} />
              <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-extrabold text-white">
                <span>Total</span>
                <span className="text-lime-400">{formatPKR(totalAmount)}</span>
              </div>
            </div>
          </div>
        </Tile>
      </div>
    </div>
  );
};

const Row = ({ label, value, strong, accent }) => (
  <div className="flex justify-between">
    <span className="text-white/50">{label}</span>
    <span className={accent ? 'font-bold text-lime-400' : strong ? 'font-bold text-white' : 'font-semibold text-white'}>{value}</span>
  </div>
);

export default PaymentForm;
