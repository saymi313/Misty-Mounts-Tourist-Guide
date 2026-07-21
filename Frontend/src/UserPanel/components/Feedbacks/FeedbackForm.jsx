import React, { useState } from 'react';
import { submitFeedback } from '../../../data/mockApi';
import { Star, Send, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [spotName, setSpotName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!spotName.trim() || !rating || !feedback.trim()) {
      setError('Please fill out all fields and pick a rating.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitFeedback({ locationName: spotName, rating, message: feedback });
      if (response.status === 201) {
        setSuccess('Thanks! Your review has been shared.');
        setSpotName('');
        setFeedback('');
        setRating(0);
      }
    } catch {
      setError('An error occurred while submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-surface p-6 sm:p-8">
      <p className="eyebrow">Share your trip</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">Write a review</h2>

      {error && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-clay-500/25 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-glacier-500/25 bg-glacier-500/5 px-4 py-3 text-sm text-glacier-700 dark:text-glacier-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="spotName" className="block text-sm font-medium text-abyss-900 dark:text-frost-50">
            Which spot or stay?
          </label>
          <div className="relative mt-1">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-400" />
            <input
              id="spotName"
              type="text"
              value={spotName}
              onChange={(e) => setSpotName(e.target.value)}
              placeholder="e.g. Attabad Lake, Hunza"
              className="block w-full rounded-xl border border-abyss-900/12 bg-white py-3 pl-11 pr-4 text-sm text-abyss-900 placeholder-frost-400 focus:border-glacier-400 focus:outline-none focus:ring-2 focus:ring-glacier-400/20 dark:border-frost-50/15 dark:bg-abyss-800 dark:text-frost-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-abyss-900 dark:text-frost-50">Your rating</label>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="rounded p-0.5"
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-8 w-8 transition-colors duration-150 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-glacier-400 text-glacier-400'
                      : 'fill-abyss-900/10 text-abyss-900/20 dark:fill-frost-50/15 dark:text-frost-50/15'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-abyss-900 dark:text-frost-50">
            Your review
          </label>
          <textarea
            id="feedback"
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe the sights, the atmosphere, tips for other travellers…"
            className="mt-1 block w-full rounded-xl border border-abyss-900/12 bg-white px-4 py-3 text-sm text-abyss-900 placeholder-frost-400 focus:border-glacier-400 focus:outline-none focus:ring-2 focus:ring-glacier-400/20 dark:border-frost-50/15 dark:bg-abyss-800 dark:text-frost-50"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
          {isSubmitting ? 'Submitting…' : (<>Submit review <Send className="h-4 w-4" /></>)}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
