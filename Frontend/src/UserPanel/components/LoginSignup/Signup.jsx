import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, ChevronDown, Compass } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { Field, inputClass, Divider, SocialButton } from './Login';

const Signup = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!type) {
      setError('Please select a traveller type');
      setLoading(false);
      return;
    }

    try {
      // Backend disconnected (dummy-data phase): simulate a successful signup.
      await new Promise((res) => setTimeout(res, 600));
      setSuccess('Account created! You can now sign in.');
      setEmail('');
      setUsername('');
      setPassword('');
      setType('');
    } catch (err) {
      setError(err.message);
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
      {success && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-glacier-500/25 bg-glacier-500/5 px-4 py-3 text-sm text-glacier-700 dark:text-glacier-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email address">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
        </Field>

        <Field label="Username">
          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" required className={inputClass} />
        </Field>

        <Field label="Password">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
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

        <Field label="I'm joining as a">
          <Compass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className={`${inputClass} cursor-pointer appearance-none pr-11`}
          >
            <option value="">Select traveller type</option>
            <option value="user">Tourist</option>
            <option value="local guide">Local Guide</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
        </Field>

        <label className="flex items-start gap-2.5 text-sm text-frost-600 dark:text-frost-300">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-abyss-900/20 text-glacier-600 focus:ring-glacier-400 dark:border-frost-50/20" />
          <span>
            I agree to the{' '}
            <button type="button" className="font-medium text-glacier-700 hover:text-glacier-600 dark:text-glacier-300 hover:underline">Terms of Service</button>{' '}
            and{' '}
            <button type="button" className="font-medium text-glacier-700 hover:text-glacier-600 dark:text-glacier-300 hover:underline">Privacy Policy</button>.
          </span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-abyss-950/30 border-t-abyss-950" />
              Creating account…
            </>
          ) : (
            <>
              Create account
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

      {success && onSwitchToLogin && (
        <p className="mt-6 text-center text-sm text-frost-600 dark:text-frost-300">
          <button onClick={onSwitchToLogin} className="font-semibold text-glacier-700 hover:text-glacier-600 dark:text-glacier-300">
            Go to sign in →
          </button>
        </p>
      )}
    </div>
  );
};

export default Signup;
