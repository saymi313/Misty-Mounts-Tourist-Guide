import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import FeedbackForm from '../components/Feedbacks/FeedbackForm';
import ChatBox from '../components/Feedbacks/ChatBox';
import TripPackageCard from '../components/Home/TripPackageCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import { getFeedbacks } from '../../data/mockApi';

const FeedbackPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getFeedbacks().then((res) => setReviews(res?.feedbacks || [])).catch(() => setReviews([]));
  }, []);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Traveller reviews</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-abyss-900 dark:text-frost-50 sm:text-5xl">
              Real stories from the{" "}
              <span className="font-accent font-normal text-glacier-700 dark:text-glacier-300">north.</span>
            </h1>
            <p className="mt-3 max-w-lg text-frost-600 dark:text-frost-300">
              Honest ratings from travellers, plus a direct line to a local guide when you're
              ready to plan.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-3xl bg-white dark:bg-abyss-900 px-6 py-4 shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10">
            <span className="font-display text-4xl font-semibold text-abyss-900 dark:text-frost-50">{avg}</span>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avg) ? 'fill-glacier-400 text-glacier-400' : 'fill-abyss-900/10 text-abyss-900/20 dark:fill-frost-50/15 dark:text-frost-50/15'}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-frost-500 dark:text-frost-400">{reviews.length} reviews</p>
            </div>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <TripPackageCard key={review._id} {...review} />
          ))}
        </div>
      </section>

      {/* Submit review + guide chat */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FeedbackForm />
          <ChatBox />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeedbackPage;
