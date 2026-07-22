import React, { useState } from 'react';
import Login from '../components/LoginSignup/Login';
import Signup from '../components/LoginSignup/Signup';
import { Tile, Eyebrow } from '../components/bento/tiles';
import { img } from '../../data/mockData';

const Wordmark = ({ className = '' }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <img src="/Logo.png" alt="Misty Mounts" className="h-9 w-9 rounded-xl object-cover" />
    <span className="text-xl font-extrabold tracking-tight text-white">
      Misty<span className="text-lime-400">Mounts</span>
    </span>
  </div>
);

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full bg-night-950 text-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ── Left: editorial photography panel ─────────────────────────── */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src={img('auth-hunza', 1400, 1800)}
          alt="Mist over the peaks of Hazara"
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-night-900/25" />
        <div className="absolute inset-0 bg-noise opacity-60" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Wordmark />

          <div className="max-w-md">
            <Eyebrow>Hazara</Eyebrow>
            <h1 className="mt-4 text-balance text-[clamp(2.4rem,4.6vw,3.6rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              Where the mist meets the{' '}
              <span className="text-lime-400">mountains,</span> your journey begins.
            </h1>
            <p className="mt-5 text-white/70">
              Curated valleys, hidden lakes, and local guides who know the way — from
              Hunza to the Deosai plains.
            </p>

            <div className="mt-10 flex items-center gap-8 border-t border-white/15 pt-6">
              {[
                ['6', 'Valleys'],
                ['120+', 'Curated spots'],
                ['24', 'Local guides'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-extrabold text-lime-400">{n}</div>
                  <div className="text-xs uppercase tracking-widest text-white/50">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right: form panel on the night canvas ─────────────────────── */}
      <main className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          {/* Mobile wordmark */}
          <Wordmark className="mb-8 lg:hidden" />

          <Tile glow="lime" pad="p-6 sm:p-8">
            <Eyebrow>{isLogin ? 'Welcome back' : 'Start exploring'}</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {isLogin
                ? 'Continue planning your trip through the north.'
                : 'Join to save spots, book stays, and chat with local guides.'}
            </p>

            {/* Segmented toggle — active pill = lime */}
            <div className="mt-7 grid grid-cols-2 gap-1 rounded-full bg-night-900 p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-300 ease-editorial ${
                  isLogin ? 'bg-lime-400 text-night-950 shadow-sm' : 'text-white/55 hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-300 ease-editorial ${
                  !isLogin ? 'bg-lime-400 text-night-950 shadow-sm' : 'text-white/55 hover:text-white'
                }`}
              >
                Create account
              </button>
            </div>

            <div className="mt-7">
              {isLogin ? <Login /> : <Signup onSwitchToLogin={() => setIsLogin(true)} />}
            </div>
          </Tile>
        </div>
      </main>
    </div>
  );
};

export default Authentication;
