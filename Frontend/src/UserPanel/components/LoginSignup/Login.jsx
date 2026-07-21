import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const from = location.state?.from?.pathname || '/user';
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-clay-500/25 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <Field label="Email address">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className={inputClass}
          />
        </Field>

        <Field label="Password">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-frost-500 dark:text-frost-400 transition-colors hover:text-glacier-700 dark:hover:text-glacier-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-frost-600 dark:text-frost-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-abyss-900/20 text-glacier-600 focus:ring-glacier-400 dark:border-frost-50/20"
            />
            Remember me
          </label>
          <button type="button" className="font-medium text-glacier-700 hover:text-glacier-600 dark:text-glacier-300">
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-abyss-950/30 border-t-abyss-950" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <Divider />

      <div className="grid grid-cols-2 gap-3">
        <SocialButton icon={<FcGoogle className="h-4 w-4" />} label="Google" />
        <SocialButton icon={<FaApple className="h-4 w-4" />} label="Apple" />
      </div>
    </div>
  );
};

// ── Small shared building blocks (also used by Signup) ─────────────────────────
export const inputClass =
  'block w-full rounded-xl border border-abyss-900/12 bg-white py-3.5 pl-11 pr-4 text-sm text-abyss-900 placeholder-frost-400 transition-all duration-200 focus:border-glacier-400 focus:outline-none focus:ring-2 focus:ring-glacier-400/20 dark:border-frost-50/15 dark:bg-abyss-800 dark:text-frost-50';

export const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-abyss-800 dark:text-frost-100">{label}</label>
    <div className="relative">{children}</div>
  </div>
);

export const Divider = () => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-abyss-900/10 dark:border-frost-50/12" />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-frost-50 px-4 text-xs uppercase tracking-widest text-frost-500 dark:bg-abyss-950 dark:text-frost-400">
        or continue with
      </span>
    </div>
  </div>
);

export const SocialButton = ({ icon, label }) => (
  <button
    type="button"
    className="flex items-center justify-center gap-2 rounded-xl border border-abyss-900/10 bg-white py-3 text-sm font-medium text-abyss-800 transition-all duration-200 hover:border-glacier-400 hover:bg-glacier-50 dark:border-frost-50/12 dark:bg-abyss-900 dark:text-frost-100 dark:hover:bg-abyss-800"
  >
    {icon}
    {label}
  </button>
);

export default Login;
