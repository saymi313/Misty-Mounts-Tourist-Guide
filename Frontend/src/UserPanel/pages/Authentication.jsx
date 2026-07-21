import React, { useState } from 'react';
import { Mountain } from 'lucide-react';
import Login from '../components/LoginSignup/Login';
import Signup from '../components/LoginSignup/Signup';
import { img } from '../../data/mockData';

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full bg-frost-50 dark:bg-abyss-950 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ── Left: editorial photography panel ─────────────────────────── */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src={img('auth-hunza', 1400, 1800)}
          alt="Mist over the peaks of Northern Pakistan"
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/55 to-abyss-900/25" />
        <div className="absolute inset-0 bg-noise opacity-60" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2.5 text-frost-50">
            <Mountain className="h-6 w-6 text-glacier-300" strokeWidth={2.25} />
            <span className="font-display text-xl font-semibold tracking-tight">
              Misty Mounts
            </span>
          </div>

          <div className="max-w-md">
            <p className="eyebrow text-glacier-300">Northern Pakistan</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] text-frost-50 text-balance">
              Where the mist meets the{" "}
              <span className="font-accent font-normal text-glacier-300">mountains,</span> your journey begins.
            </h1>
            <p className="mt-5 text-frost-200/90">
              Curated valleys, hidden lakes, and local guides who know the way — from
              Hunza to the Deosai plains.
            </p>

            <div className="mt-10 flex items-center gap-8 border-t border-frost-50/15 pt-6 text-frost-100">
              {[
                ['6', 'Valleys'],
                ['120+', 'Curated spots'],
                ['24', 'Local guides'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-semibold text-glacier-300">{n}</div>
                  <div className="text-xs uppercase tracking-widest text-frost-200/80">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right: form panel ─────────────────────────────────────────── */}
      <main className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          {/* Mobile wordmark */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Mountain className="h-6 w-6 text-glacier-700 dark:text-glacier-300" strokeWidth={2.25} />
            <span className="font-display text-xl font-semibold text-abyss-900 dark:text-frost-50">Misty Mounts</span>
          </div>

          <p className="eyebrow">{isLogin ? 'Welcome back' : 'Start exploring'}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-abyss-900 dark:text-frost-50">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-frost-600 dark:text-frost-300">
            {isLogin
              ? 'Continue planning your trip through the north.'
              : 'Join to save spots, book stays, and chat with local guides.'}
          </p>

          {/* Segmented toggle */}
          <div className="mt-8 grid grid-cols-2 gap-1 rounded-full bg-frost-100 dark:bg-abyss-800 p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-300 ease-editorial ${
                isLogin ? 'bg-white text-abyss-900 shadow-sm dark:bg-abyss-900 dark:text-frost-50' : 'text-frost-600 hover:text-abyss-800 dark:text-frost-300 dark:hover:text-frost-100'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-300 ease-editorial ${
                !isLogin ? 'bg-white text-abyss-900 shadow-sm dark:bg-abyss-900 dark:text-frost-50' : 'text-frost-600 hover:text-abyss-800 dark:text-frost-300 dark:hover:text-frost-100'
              }`}
            >
              Create account
            </button>
          </div>

          <div className="mt-8">
            {isLogin ? <Login /> : <Signup onSwitchToLogin={() => setIsLogin(true)} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Authentication;
