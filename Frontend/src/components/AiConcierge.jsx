import useFeatures from "../hooks/useFeatures";
import FeatureNotice from "../components/FeatureNotice";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Send, Loader2, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../data/api";
import useTrip from "../hooks/useTrip";

/**
 * "Ask Misty" — a floating AI travel concierge. Talks to /api/ai/chat (Gemini
 * intent classification + approved catalogue selection, with server-controlled replies).
 */

const SUGGESTIONS = [
  "Plan 4 relaxed days in Hunza",
  "Quiet lakes near Skardu",
  "Best time to visit Fairy Meadows",
  "Family-friendly tours",
];

const GREETING = {
  role: "model",
  text: "Aoa! I'm Misty 👋 — your guide to Northern Pakistan. Ask me to plan a trip, find spots or tours, or how to stay safe.",
};

// Very small markdown-ish renderer: **bold** + bullet lines + line breaks.
const render = (text) =>
  text.split("\n").map((line, i) => {
    const bulleted = /^\s*[•\-*]\s+/.test(line);
    const html = line
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^\s*[•\-*]\s+/, "");
    return (
      <p key={i} className={bulleted ? "flex gap-1.5" : line.trim() ? "" : "h-2"}>
        {bulleted && <span className="text-lime-400">•</span>}
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </p>
    );
  });

const AiConcierge = () => {
  const features = useFeatures();
  const navigate = useNavigate();
  const { toggle, isInTrip } = useTrip();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, busy]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy || !features.gemini) return;
    const next = [...messages, { role: "user", text: msg }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data } = await api.post("/ai/chat", {
        messages: next.filter((m) => m !== GREETING).slice(-10).map((m) => ({ role: m.role, text: m.text })),
      }, { timeout: 30000 });
      setMessages((m) => [...m, { role: "model", text: data?.text || "Sorry, I couldn't answer that. Try rephrasing?", sources: data.sources || [], fallback: data.fallback }]);
    } catch (error) {
      setMessages((m) => [...m, { role: "model", text: error.response?.data?.error || "I'm having trouble connecting right now. Meanwhile, try the Trip Planner or the Safety page." }]);
    } finally {
      setBusy(false);
    }
  };

  if (!features.gemini) return <div className="fixed bottom-5 right-5 z-[60] max-w-[min(92vw,320px)] rounded-2xl bg-night-900 px-3 text-white shadow-lg"><FeatureNotice feature="Ask Misty" state={features.state}>You can still browse destinations and build a basic itinerary.</FeatureNotice></div>;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            onClick={() => setOpen(true)}
            aria-label="Ask Misty — AI concierge"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-lime-400 px-4 py-3 font-extrabold text-night-950 shadow-[0_12px_32px_-8px_rgba(163,230,53,0.6)]"
          >
            {/* attention pulse */}
            {!reduce && (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full bg-lime-400"
                initial={{ opacity: 0.45, scale: 1 }}
                animate={{ opacity: 0, scale: 1.35 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <motion.span
              className="relative"
              animate={reduce ? {} : { rotate: [0, -14, 12, -8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
            >
              <Bot className="h-5 w-5" />
            </motion.span>
            <span className="relative">Ask Misty</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.85, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-5 right-5 z-[60] flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-night-900 shadow-2xl"
          >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-night-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400 text-night-950"><Bot className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-extrabold text-white">Ask Misty</p>
                <p className="text-[11px] text-white/60">Pakistan travel &amp; Misty Mounts help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-1 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-lime-400 text-night-950" : "bg-night-700 text-white/90"
                }`}>
                  {render(m.text)}
                  {m.fallback && <p className="text-xs text-white/60">Limited assistance · AI unavailable or unverified</p>}
                  {m.sources?.length > 0 && <div className="space-y-2 border-t border-white/15 pt-2">
                    <p className="text-xs text-white/60">Explore on Misty Mounts</p>
                    {m.sources.map(source => <div key={source.href}>
                      <button onClick={() => { navigate(source.href); setOpen(false); }} className="min-h-11 text-left text-lime-300 underline">{source.title}</button>
                      {source.spot && <button onClick={() => toggle({ type: 'spot', id: source.id, title: source.title, city: source.spot.city, image: source.spot.picture, href: source.href })} className="block min-h-11 text-xs font-semibold text-white/80">{isInTrip('spot', source.id) ? 'Remove from trip' : 'Save to trip'}</button>}
                    </div>)}
                  </div>}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-night-700 px-3.5 py-2.5 text-sm text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" /> Misty is thinking…
                </div>
              </div>
            )}

            {messages.length <= 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="rounded-full border border-white/12 bg-night-800 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:border-lime-400/50 hover:text-white">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="flex gap-2 border-t border-white/10 px-3 py-2 text-[11px]">
            <button onClick={() => navigate("/discover")} className="font-semibold text-lime-400 hover:underline">Vibe search</button>
            <span className="text-white/20">·</span>
            <button onClick={() => navigate("/plan")} className="font-semibold text-lime-400 hover:underline">Trip Planner</button>
            <span className="text-white/20">·</span>
            <button onClick={() => navigate("/safety")} className="font-semibold text-lime-400 hover:underline">Safety</button>
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 border-t border-white/10 bg-night-800 p-3"
          >
            <input
              value={input}
              aria-label="Message to Misty"
              maxLength={2000}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trips, spots, safety…"
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-night-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-lime-400/50"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400 text-night-950 transition-transform hover:-translate-y-0.5 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiConcierge;
