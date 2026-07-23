import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, MapPin, ArrowLeft, MessageCircle, Send, Globe, Compass, Briefcase,
  AlertCircle, CheckCircle2, CalendarDays, ArrowUpRight, Map as MapIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Btn, inputCls } from "../components/bento/tiles";
import ChatBox from "../components/Feedbacks/ChatBox";
import { useAuth } from "../../context/AuthContext";
import { getGuide, getGuideFeedbacks, submitGuideFeedback } from "../../data/guidesApi";
import { LIVE } from "../../data/api";
import { timeAgo, formatDate } from "../../utils/datetime";

const EASE = [0.16, 1, 0.3, 1];

const Stars = ({ value, className = "h-4 w-4" }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`${className} ${i <= Math.round(value) ? "fill-lime-400 text-lime-400" : "fill-white/10 text-white/15"}`} />
    ))}
  </span>
);

const DetailRow = ({ icon: Icon, label, items }) => {
  const arr = Array.isArray(items) ? items : items ? [items] : [];
  if (arr.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/40">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {arr.map((x) => (
          <span key={x} className="rounded-full bg-night-700 px-3 py-1 text-xs font-medium text-white/75">{x}</span>
        ))}
      </div>
    </div>
  );
};

const Shell = ({ children }) => (
  <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
    <Navbar />
    <main className="mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-8">{children}</main>
    <Footer />
  </div>
);

const GuideDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [guide, setGuide] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [formOk, setFormOk] = useState("");

  useEffect(() => {
    if (!LIVE) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const [g, fb] = await Promise.all([getGuide(id), getGuideFeedbacks(id).catch(() => [])]);
        if (!alive) return;
        setGuide(g);
        setReviews(fb || []);
      } catch { /* ignore */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setFormErr(""); setFormOk("");
    if (!rating) { setFormErr("Please pick a rating."); return; }
    if (message.trim().length < 10) { setFormErr("Review must be at least 10 characters."); return; }
    setSubmitting(true);
    try {
      const fb = await submitGuideFeedback(id, { rating, message });
      setReviews((prev) => [fb, ...prev]);
      setRating(0); setMessage(""); setFormOk("Thanks! Your review has been shared.");
      getGuide(id).then(setGuide).catch(() => {}); // refresh aggregate rating
    } catch (err) {
      setFormErr(err?.response?.data?.error || "Couldn't submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Shell><Tile className="py-16 text-center"><p className="text-white/60">Loading guide…</p></Tile></Shell>;
  if (!guide) {
    return (
      <Shell>
        <Tile className="py-16 text-center">
          <p className="text-white/60">Guide not found.</p>
          <Link to="/guides" className="mt-4 inline-block font-semibold text-lime-400">← Back to guides</Link>
        </Tile>
      </Shell>
    );
  }

  const firstName = (guide.name || "the guide").split(" ")[0];

  return (
    <Shell>
      <Link to="/guides" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition-colors hover:text-lime-400">
        <ArrowLeft className="h-4 w-4" /> All guides
      </Link>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <Tile glow="lime" pad="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {guide.avatar ? (
                <img src={guide.avatar} alt={guide.name} className="h-24 w-24 shrink-0 rounded-3xl object-cover ring-2 ring-lime-400/25" />
              ) : (
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-lime-400 text-4xl font-extrabold text-night-950">
                  {(guide.name || "G").charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 rounded-full bg-lime-400/15 px-2.5 py-1 text-xs font-bold text-lime-400">Local Guide</span>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">{guide.name}</h1>
                {guide.username && <p className="text-sm text-white/40">@{guide.username}</p>}
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60"><MapPin className="h-4 w-4 text-lime-400" /> {guide.city || "Location not set"}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Stars value={guide.rating} />
                  <span className="text-sm font-bold text-white">{guide.rating ? guide.rating.toFixed(1) : "New"}</span>
                  <span className="text-sm text-white/40">· {guide.reviewCount} review{guide.reviewCount !== 1 ? "s" : ""}</span>
                </div>
                {guide.memberSince && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/40">
                    <CalendarDays className="h-3.5 w-3.5" /> Guide since {formatDate(guide.memberSince, { month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-6 leading-relaxed text-white/70">
              {guide.bio || `${firstName} is a local guide on Misty Mounts. Message them to start planning your trip.`}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <DetailRow icon={Briefcase} label="Experience" items={guide.experience} />
              <DetailRow icon={Globe} label="Languages" items={guide.languages} />
              <DetailRow icon={Compass} label="Specialties" items={guide.specialties} />
              <DetailRow icon={MapPin} label="Areas covered" items={guide.serviceAreas} />
            </div>
            <div className="mt-7">
              <Btn onClick={() => setShowChat((s) => !s)}>
                <MessageCircle className="h-4 w-4" /> {showChat ? "Hide chat" : `Message ${firstName}`}
              </Btn>
            </div>
          </Tile>
        </motion.div>

        {/* Review form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05, ease: EASE }}>
          <Tile pad="p-6 sm:p-7" className="h-full">
            <Eyebrow><Star className="h-3.5 w-3.5" /> Rate this guide</Eyebrow>
            <h2 className="mt-2 text-xl font-extrabold text-white">Leave a review</h2>
            {!user ? (
              <p className="mt-4 text-sm text-white/60">Please sign in to leave a review.</p>
            ) : (
              <form onSubmit={submitReview} className="mt-5 space-y-4">
                {formErr && (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {formErr}
                  </div>
                )}
                {formOk && (
                  <div className="flex items-center gap-2 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm text-lime-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {formOk}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(s)}
                      className="rounded p-0.5"
                      aria-label={`${s} star${s > 1 ? "s" : ""}`}
                    >
                      <Star className={`h-8 w-8 transition-colors ${s <= (hover || rating) ? "fill-lime-400 text-lime-400" : "fill-white/10 text-white/15"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`How was your experience with ${firstName}?`}
                  className={`${inputCls} resize-none`}
                />
                <Btn type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Submitting…" : (<>Submit review <Send className="h-4 w-4" /></>)}
                </Btn>
              </form>
            )}
          </Tile>
        </motion.div>
      </div>

      {/* Spots curated by this guide */}
      {guide.curatedSpots?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Spots by {firstName} <span className="text-white/40">({guide.curatedSpots.length})</span>
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guide.curatedSpots.map((s) => (
              <Link key={s._id} to={`/city/${encodeURIComponent(s.city)}/spot/${s._id}`} className="group">
                <Tile pad="p-0" className="overflow-hidden transition-colors hover:border-lime-400/40">
                  <div className="relative h-36 w-full overflow-hidden">
                    {s.picture ? (
                      <img src={s.picture} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-night-700 text-white/25"><MapIcon className="h-8 w-8" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-sm font-bold text-white">{s.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3 w-3" /> {s.location || s.city}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-lime-400">View spot <ArrowUpRight className="h-3.5 w-3.5" /></span>
                  </div>
                </Tile>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Chat */}
      {showChat && (
        <div className="mt-4">
          <ChatBox guide={guide} />
        </div>
      )}

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Reviews <span className="text-white/40">({reviews.length})</span>
        </h2>
        {reviews.length === 0 ? (
          <Tile className="mt-4 py-12 text-center">
            <p className="text-white/60">No reviews yet — be the first to review {firstName}.</p>
          </Tile>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {reviews.map((r) => (
              <Tile key={r._id} pad="p-5">
                <div className="flex items-center gap-3">
                  {r.avatar ? (
                    <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-night-700 font-bold text-white/70">
                      {(r.name || "T").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{r.name || "Traveller"}</p>
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} className="h-3 w-3" />
                      <span className="text-xs text-white/40">{r.createdAt ? timeAgo(r.createdAt) : r.date}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{r.message}</p>
              </Tile>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
};

export default GuideDetail;
