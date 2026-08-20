import React, { useEffect, useState } from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import api from "../data/api";

/**
 * AI-generated digest of a set of reviews (summary + pros/cons) via
 * /api/ai/summarize (Gemini free tier, with a keyword fallback). Renders nothing
 * for fewer than 3 reviews. Accepts reviews with { rating, text|comment }.
 */
const ReviewSummary = ({ reviews = [], subject, className = "" }) => {
  const [data, setData] = useState(null);
  const [state, setState] = useState("idle"); // idle | loading | ok | error

  const enough = reviews.length >= 3;

  useEffect(() => {
    if (!enough) return;
    let alive = true;
    setState("loading");
    api
      .post("/ai/summarize", {
        subject,
        reviews: reviews.map((r) => ({ rating: r.rating, text: r.text || r.comment || r.message })),
      })
      .then(({ data }) => { if (alive) { setData(data); setState("ok"); } })
      .catch(() => alive && setState("error"));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length, subject]);

  if (!enough || state === "error") return null;

  return (
    <div className={`rounded-2xl border border-lime-400/20 bg-lime-400/[0.05] p-5 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-lime-400">
        <Sparkles className="h-3.5 w-3.5" /> AI review summary
      </div>

      {state === "loading" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Summarizing {reviews.length} reviews…
        </p>
      )}

      {state === "ok" && data && (
        <>
          <p className="mt-3 text-sm leading-relaxed text-white/85">{data.summary}</p>
          {(data.pros?.length > 0 || data.cons?.length > 0) && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.pros?.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-lime-400"><ThumbsUp className="h-3.5 w-3.5" /> Travellers loved</p>
                  <ul className="mt-1.5 space-y-1">
                    {data.pros.map((p) => <li key={p} className="text-sm capitalize text-white/70">• {p}</li>)}
                  </ul>
                </div>
              )}
              {data.cons?.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-amber-400"><ThumbsDown className="h-3.5 w-3.5" /> Worth noting</p>
                  <ul className="mt-1.5 space-y-1">
                    {data.cons.map((c) => <li key={c} className="text-sm capitalize text-white/70">• {c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewSummary;
