import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Btn } from '../bento/tiles';
import { required, email as emailRule, validate, hasErrors } from '../../../utils/validation';
import { landingFor } from '../../../utils/roles';
import OtpVerify from './OtpVerify';
import ForgotPassword from './ForgotPassword';

const EASE = [0.16, 1, 0.3, 1];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const navigate = useNavigate();
  const location = useLocation();
  const { login, applySession } = useAuth();

  const clear = (key) => errors[key] && setErrors((x) => ({ ...x, [key]: undefined }));

  const handleVerified = (data) => {
    applySession(data);
    navigate(location.state?.from?.pathname || landingFor(data.type), { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const found = validate(
      { email, password },
      {
        email: [required('Email is required'), emailRule()],
        password: [required('Password is required')],
      }
    );
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const from = location.state?.from?.pathname;
        navigate(from || landingFor(result.user?.type), { replace: true });
      } else if (result.needsVerification) {
        setVerifyEmail(result.email);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (verifyEmail) {
    return <OtpVerify email={verifyEmail} onVerified={handleVerified} onBack={() => setVerifyEmail(null)} />;
  }

  if (mode === 'forgot') {
    return <ForgotPassword onDone={handleVerified} onBack={() => setMode('login')} initialEmail={email} />;
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
      {notice && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm text-lime-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleLogin} noValidate className="space-y-5">
        <Field label="Email address" error={errors.email}>
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear('email');
            }}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className={`${inputClass} ${errors.email ? inputErrClass : ''}`}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear('password');
            }}
            placeholder="Enter your password"
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

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-white/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-night-900 accent-lime-400 focus:ring-2 focus:ring-lime-400/30"
            />
            Remember me
          </label>
          <button type="button" onClick={() => setMode('forgot')} className="font-semibold text-lime-400 transition-colors hover:text-lime-300">
            Forgot password?
          </button>
        </div>

        <Btn type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-night-950/30 border-t-night-950" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
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
    </motion.div>
  );
};

// ── Small shared building blocks (also used by Signup) — night + lime ──────────
export const inputClass =
  'block w-full rounded-2xl border border-white/10 bg-night-900 py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/15';

// Error-state overrides for inputClass / inputCls (rose border + ring).
export const inputErrClass = '!border-rose-400/60 focus:!border-rose-400/60 focus:!ring-rose-400/15';

export const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-white/70">{label}</label>
    <div className="relative">{children}</div>
    {error && (
      <p className="flex items-center gap-1 text-xs font-medium text-rose-400">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
      </p>
    )}
  </div>
);

export const Divider = () => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-white/10" />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-night-800 px-4 text-xs uppercase tracking-widest text-white/40">
        or continue with
      </span>
    </div>
  </div>
);

export const SocialButton = ({ icon, label }) => (
  <button
    type="button"
    className="flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-night-900 py-3 text-sm font-semibold text-white transition-colors hover:border-lime-400/50"
  >
    {icon}
    {label}
  </button>
);

export default Login;
