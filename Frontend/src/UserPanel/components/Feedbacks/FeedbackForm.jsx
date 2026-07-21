import React, { useState } from 'react';
import { submitFeedback } from '../../../data/mockApi';
import { Star, Send, MapPin, CheckCircle2, AlertCircle, PenLine } from 'lucide-react';
import { Tile, Eyebrow, Btn, inputCls } from '../bento/tiles';
import { required, min, minLen, validate, hasErrors } from '../../../utils/validation';

const inputErr = '!border-rose-400/60 focus:!border-rose-400/60 focus:!ring-rose-400/15';
const errNote = 'mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400';

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [spotName, setSpotName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clear = (key) => errors[key] && setErrors((x) => ({ ...x, [key]: undefined }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const found = validate(
      { spotName, rating, feedback },
      {
        spotName: [required('Please enter the spot or stay name')],
        rating: [min(1, 'Please pick a rating')],
        feedback: [required('Please write your review'), minLen(10, 'Review must be at least 10 characters')],
      }
    );
    if (hasErrors(found)) {
      setErrors(found);
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
    <Tile glow="lime" pad="p-6 sm:p-8" className="h-full">
      <Eyebrow><PenLine className="h-3.5 w-3.5" /> Share your trip</Eyebrow>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
        Write a <span className="text-lime-400">review</span>
      </h2>

      {error && (
        <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm text-lime-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="spotName" className="block text-sm font-semibold text-white/70">
            Which spot or stay?
          </label>
          <div className="relative mt-1.5">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              id="spotName"
              type="text"
              value={spotName}
              onChange={(e) => { setSpotName(e.target.value); clear('spotName'); }}
              placeholder="e.g. Attabad Lake, Hunza"
              aria-invalid={!!errors.spotName}
              className={`${inputCls} !pl-11 ${errors.spotName ? inputErr : ''}`}
            />
          </div>
          {errors.spotName && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.spotName}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/70">Your rating</label>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => { setRating(star); clear('rating'); }}
                className="rounded p-0.5"
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-8 w-8 transition-colors duration-150 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-lime-400 text-lime-400'
                      : 'fill-white/10 text-white/15'
                  }`}
                />
              </button>
            ))}
          </div>
          {errors.rating && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.rating}</p>}
        </div>

        <div>
          <label htmlFor="feedback" className="block text-sm font-semibold text-white/70">
            Your review
          </label>
          <textarea
            id="feedback"
            rows="4"
            value={feedback}
            onChange={(e) => { setFeedback(e.target.value); clear('feedback'); }}
            placeholder="Describe the sights, the atmosphere, tips for other travellers…"
            aria-invalid={!!errors.feedback}
            className={`${inputCls} mt-1.5 resize-none ${errors.feedback ? inputErr : ''}`}
          />
          {errors.feedback && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.feedback}</p>}
        </div>

        <Btn type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting…' : (<>Submit review <Send className="h-4 w-4" /></>)}
        </Btn>
      </form>
    </Tile>
  );
};

export default FeedbackForm;
