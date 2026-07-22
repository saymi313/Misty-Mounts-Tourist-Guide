import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, ChevronDown, Compass } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Field, inputClass, inputErrClass, Divider, SocialButton } from './Login';
import { Btn } from '../bento/tiles';
import { required, email as emailRule, minLen, mustBeTrue, validate, hasErrors } from '../../../utils/validation';
import api, { LIVE } from '../../../data/api';
import { useAuth } from '../../../context/AuthContext';
import OtpVerify from './OtpVerify';

const EASE = [0.16, 1, 0.3, 1];

const Signup = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(null);
  const navigate = useNavigate();
  const { applySession } = useAuth();

  const clear = (key) => errors[key] && setErrors((x) => ({ ...x, [key]: undefined }));

  const handleVerified = (data) => {
    applySession(data);
    navigate('/user', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const found = validate(
      { email, username, password, type, terms },
      {
        email: [required('Email is required'), emailRule()],
        username: [required('Username is required'), minLen(3, 'Username must be at least 3 characters')],
        password: [required('Password is required'), minLen(6, 'Password must be at least 6 characters')],
        type: [required('Please select a traveller type')],
        terms: [mustBeTrue('Please accept the terms to continue')],
      }
    );
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }

    setLoading(true);
    try {
      if (LIVE) {
        const { data } = await api.post('/user/auth/signup', { email, username, password, type });
        if (data.needsVerification) {
          setVerifyEmail(email);
          return;
        }
        setSuccess('Account created! You can now sign in.');
      } else {
        // Dummy-data phase: simulate a successful signup.
        await new Promise((res) => setTimeout(res, 600));
        setSuccess('Account created! You can now sign in.');
      }
      setEmail('');
      setUsername('');
      setPassword('');
      setType('');
      setTerms(false);
      setErrors({});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (verifyEmail) {
    return <OtpVerify email={verifyEmail} onVerified={handleVerified} onBack={() => setVerifyEmail(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="Email address" error={errors.email}>
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clear('email'); }} placeholder="you@example.com" aria-invalid={!!errors.email} className={`${inputClass} ${errors.email ? inputErrClass : ''}`} />
        </Field>

        <Field label="Username" error={errors.username}>
          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); clear('username'); }} placeholder="Choose a username" aria-invalid={!!errors.username} className={`${inputClass} ${errors.username ? inputErrClass : ''}`} />
        </Field>

        <Field label="Password" error={errors.password}>
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clear('password'); }}
            placeholder="Create a password"
            aria-invalid={!!errors.password}
            className={`${inputClass} pr-12 ${errors.password ? inputErrClass : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/40 transition-colors hover:text-lime-400"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </Field>

        <Field label="I'm joining as a" error={errors.type}>
          <Compass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); clear('type'); }}
            aria-invalid={!!errors.type}
            className={`${inputClass} cursor-pointer appearance-none pr-11 ${errors.type ? inputErrClass : ''}`}
          >
            <option value="">Select traveller type</option>
            <option value="user">Tourist</option>
            <option value="local guide">Local Guide</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        </Field>

        <div>
          <label className="flex items-start gap-2.5 text-sm text-white/70">
            <input type="checkbox" checked={terms} onChange={(e) => { setTerms(e.target.checked); clear('terms'); }} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-night-900 accent-lime-400 focus:ring-2 focus:ring-lime-400/30" />
            <span>
              I agree to the{' '}
              <button type="button" className="font-semibold text-lime-400 transition-colors hover:text-lime-300 hover:underline">Terms of Service</button>{' '}
              and{' '}
              <button type="button" className="font-semibold text-lime-400 transition-colors hover:text-lime-300 hover:underline">Privacy Policy</button>.
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.terms}
            </p>
          )}
        </div>

        <Btn type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-night-950/30 border-t-night-950" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Btn>
      </form>

      <Divider />

      <div className="grid grid-cols-2 gap-3">
        <SocialButton icon={<FcGoogle className="h-4 w-4" />} label="Google" />
        <SocialButton icon={<FaApple className="h-4 w-4" />} label="Apple" />
      </div>

      {success && onSwitchToLogin && (
        <p className="mt-6 text-center text-sm text-white/60">
          <button onClick={onSwitchToLogin} className="font-semibold text-lime-400 transition-colors hover:text-lime-300">
            Go to sign in →
          </button>
        </p>
      )}
    </motion.div>
  );
};

export default Signup;
