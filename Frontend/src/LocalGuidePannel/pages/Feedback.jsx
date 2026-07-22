import React, { useState, useEffect } from "react";
import { Star, MessageSquare, TrendingUp, Award } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { Card, SectionHead, StatCard } from "../../components/dashboard/ui";
import { getFeedbacks } from "../../data/mockApi";

/** Five-star row, filled up to `rating`. */
const Stars = ({ rating }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`h-4 w-4 ${
          n <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"
        }`}
      />
    ))}
  </span>
);

/** "2026-06-14" → "14 Jun 2026". */
const fmtDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    getFeedbacks().then((d) => setFeedbacks(d.feedbacks || [])).catch(() => {});
  }, []);

  const total = feedbacks.length;
  const avg = total ? (feedbacks.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : "0.0";
  const fiveStar = feedbacks.filter((r) => r.rating === 5).length;

  return (
    <GuideLayout greeting="Traveller reviews" subtitle="What visitors are saying about your valley">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MessageSquare} tone="sky" label="Total reviews" value={total} />
        <StatCard icon={TrendingUp} tone="emerald" label="Average rating" value={avg} />
        <StatCard icon={Award} tone="amber" label="5-star reviews" value={fiveStar} />
      </div>

      {/* Review list */}
      <Card className="mt-6">
        <SectionHead title="All reviews" sub={`${total} traveller ${total === 1 ? "review" : "reviews"}`} />
        <div className="divide-y divide-slate-100">
          {feedbacks.map((f) => (
            <article key={f._id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
              <img
                src={f.avatar}
                alt={f.name}
                className="h-12 w-12 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{f.name}</p>
                    <p className="truncate text-xs text-slate-400">{f.locationName}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Stars rating={f.rating} />
                    <span className="text-xs text-slate-400">{fmtDate(f.date)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.message}</p>
                {f.trip && (
                  <span className="mt-3 inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                    {f.trip}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Card>
    </GuideLayout>
  );
};

export default Feedback;
