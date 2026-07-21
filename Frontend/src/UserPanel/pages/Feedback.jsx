import React, { useEffect, useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import FeedbackForm from '../components/Feedbacks/FeedbackForm';
import ChatBox from '../components/Feedbacks/ChatBox';
import TripPackageCard from '../components/Home/TripPackageCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import { getFeedbacks } from '../../data/mockApi';
import { Tile, Eyebrow, SectionHead, Stars } from '../components/bento/tiles';

const EASE = [0.16, 1, 0.3, 1];
const GLOWS = ['lime', 'green', 'sky'];

/** Night stat tile with a lime number. */
const StatTile = ({ value, label, glow, delay = 0, children }) => (
  <Tile glow={glow} delay={delay} className="flex flex-col justify-center">
    <div className="text-3xl font-extrabold tracking-tight text-lime-400 sm:text-4xl">{value}</div>
    {children}
    <div className="mt-1 text-sm text-white/55">{label}</div>
  </Tile>
);

const FeedbackPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getFeedbacks().then((res) => setReviews(res?.feedbacks || [])).catch(() => setReviews([]));
  }, []);

  const avgNum = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const avg = reviews.length ? avgNum.toFixed(1) : '—';
  const fiveStar = reviews.filter((r) => r.rating === 5).length;
  const spotsReviewed = new Set(reviews.map((r) => (r.locationName || '').trim())).size;

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />

      {/* ── Header + stats ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl"
        >
          <Eyebrow><Star className="h-3.5 w-3.5" /> Traveller reviews</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl">
            Real stories from the <span className="text-lime-400">north.</span>
          </h1>
          <p className="mt-4 max-w-lg text-white/70">
            Honest ratings from travellers, plus a direct line to a local guide when you're
            ready to plan.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile value={avg} label="Average rating" glow="lime" delay={0}>
            <Stars value={Math.round(avgNum)} className="mt-1.5" />
          </StatTile>
          <StatTile value={reviews.length} label="Traveller reviews" glow="green" delay={0.05} />
          <StatTile value={fiveStar} label="5-star ratings" glow="sky" delay={0.1} />
          <StatTile value={spotsReviewed} label="Spots reviewed" delay={0.15} />
        </div>
      </section>

      {/* ── Reviews bento ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
        <SectionHead eyebrow="Word from the trail" title="What travellers say." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <TripPackageCard
              key={review._id}
              {...review}
              delay={(i % 3) * 0.05}
              glow={GLOWS[i % 3]}
              className={i % 4 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}
            />
          ))}
        </div>
      </section>

      {/* ── Submit review + guide chat ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <SectionHead eyebrow="Your turn" title="Review it or ask a guide." icon={MessageCircle} />
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <FeedbackForm />
          <ChatBox />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeedbackPage;
