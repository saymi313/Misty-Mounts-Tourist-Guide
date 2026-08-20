import React, { useState } from "react";
import { Check } from "lucide-react";
import api from "../data/api";

/**
 * Email capture (waitlist / deals). Posts to /api/waitlist. Top of the growth
 * funnel — collects demand you can show as traction.
 */
const WaitlistForm = ({ source = "landing", className = "" }) => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr("Enter a valid email."); return; }
    setErr("");
    setState("loading");
    try {
      await api.post("/waitlist", { email: email.trim(), source });
      setState("done");
    } catch {
      setState("error");
      setErr("Something went wrong. Please try again.");
    }
  };

  if (state === "done") {
    return (
      <div className={`flex items-center justify-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-5 py-3 text-sm font-bold text-lime-300 ${className}`}>
        <Check className="h-4 w-4" /> You're on the list. We'll be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`w-full ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(""); }}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-white/12 bg-night-800 px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-lime-400/50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 rounded-full bg-lime-400 px-6 py-3 text-sm font-extrabold text-night-950 transition-transform hover:-translate-y-0.5 hover:bg-lime-300 disabled:opacity-60"
        >
          {state === "loading" ? "Joining…" : "Notify me"}
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-rose-400">{err}</p>}
    </form>
  );
};

export default WaitlistForm;
