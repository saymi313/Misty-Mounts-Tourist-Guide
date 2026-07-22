import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Btn } from '../bento/tiles';
import api from '../../../data/api';

const EASE = [0.16, 1, 0.3, 1];
const LEN = 6;

/** Beautiful 6-digit OTP verification step (night + lime). */
const OtpVerify = ({ email, onVerified, onBack }) => {
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('A 6-digit code is on its way to your inbox.');
  const [cooldown, setCooldown] = useState(0);
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const code = digits.join('');

  const setDigit = (i, v) => {
    const clean = v.replace(/\D/g, '');
    setError('');
    if (!clean) {
      setDigits((d) => { const n = [...d]; n[i] = ''; return n; });
      return;
    }
    setDigits((d) => {
      const n = [...d];
      clean.split('').slice(0, LEN - i).forEach((ch, k) => { n[i + k] = ch; });
      return n;
    });
    refs.current[Math.min(i + clean.length, LEN - 1)]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, LEN);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: LEN }, (_, k) => text[k] || ''));
    refs.current[Math.min(text.length, LEN - 1)]?.focus();
  };

  const verify = async (e) => {
    e?.preventDefault();
    if (code.length !== LEN) { setError('Enter the 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/user/auth/verify-otp', { email, otp: code });
      onVerified(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError('');
    try {
      await api.post('/user/auth/resend-otp', { email });
      setInfo('A new code has been sent to your email.');
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend the code');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-white">Verify your email</h2>
          <p className="truncate text-sm text-white/60">
            Enter the code sent to <span className="font-semibold text-lime-400">{email}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {!error && info && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm text-lime-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {info}
        </div>
      )}

      <form onSubmit={verify}>
        <div className="flex justify-between gap-2 sm:gap-3" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={LEN}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-full rounded-2xl border border-white/12 bg-night-900 text-center text-2xl font-bold text-white outline-none transition-colors focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/15 sm:h-16"
            />
          ))}
        </div>

        <Btn type="submit" disabled={loading} className="mt-6 w-full">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-night-950/30 border-t-night-950" />
              Verifying…
            </>
          ) : (
            <>Verify &amp; continue <ArrowRight className="h-4 w-4" /></>
          )}
        </Btn>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 font-semibold text-white/60 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="inline-flex items-center gap-1.5 font-semibold text-lime-400 transition-colors hover:text-lime-300 disabled:cursor-not-allowed disabled:text-white/30"
        >
          <RefreshCw className="h-4 w-4" /> {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </motion.div>
  );
};

export default OtpVerify;
