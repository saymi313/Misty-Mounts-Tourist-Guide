import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Emergency SOS console. Grabs the traveller's GPS (browser Geolocation, no
 * backend) and turns it into a shareable map link for WhatsApp / copy, plus
 * one-tap dial to Rescue 1122 / Police. Icon-free, subtle sizing.
 */
const SosCard = ({ className = "" }) => {
  const [state, setState] = useState("idle"); // idle | locating | ready | error
  const [pos, setPos] = useState(null);
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();

  const locate = () => {
    if (!navigator.geolocation) { setState("error"); return; }
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) });
        setState("ready");
      },
      () => setState("error"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const mapsLink = pos ? `https://maps.google.com/?q=${pos.lat},${pos.lng}` : "";
  const message = pos ? `I need help. My live location: ${mapsLink} (accuracy ~${pos.acc}m). Sent via Misty Mounts.` : "";
  const waLink = pos ? `https://wa.me/?text=${encodeURIComponent(message)}` : "";

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* blocked */ }
  };

  return (
    <section className={`relative overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-night-800 p-5 sm:p-6 ${className}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" />

      {/* Beacon */}
      <div className="relative flex items-center gap-3">
        <span className="relative flex h-4 w-4 items-center justify-center">
          {!reduce && [0, 0.8, 1.6].map((d) => (
            <motion.span
              key={d}
              className="absolute inset-0 rounded-full border border-rose-400/60"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 2.4, delay: d, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-white">Emergency SOS</h2>
          <p className="text-xs text-white/50">Reach help and share where you are.</p>
        </div>
      </div>

      {/* Quick dial */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <a href="tel:1122" className="rounded-xl bg-rose-500 px-4 py-2.5 text-center text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
          Rescue 1122
        </a>
        <a href="tel:15" className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-white/10 active:scale-[0.98]">
          Police 15
        </a>
      </div>

      {/* Location share */}
      <div className="mt-3">
        {state !== "ready" && (
          <button
            onClick={locate}
            disabled={state === "locating"}
            className="w-full rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
          >
            {state === "locating" ? "Getting your location" : "Share my live location"}
          </button>
        )}

        {state === "error" && (
          <p className="mt-3 text-sm text-rose-300">Couldn't get your location. Enable location access and try again.</p>
        )}

        {state === "ready" && pos && (
          <div className="rounded-xl border border-white/10 bg-night-900/60 p-3.5">
            <p className="text-sm text-white/75">
              {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} <span className="text-white/35">±{pos.acc}m</span>
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#25D366] px-2 py-2 text-center text-xs font-bold text-night-950 transition-transform hover:-translate-y-0.5">WhatsApp</a>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white/10 px-2 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-white/20">Map</a>
              <button onClick={copy} className="rounded-lg bg-white/10 px-2 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-white/20">{copied ? "Copied" : "Copy"}</button>
            </div>
            <button onClick={locate} className="mt-3 text-xs font-semibold text-white/40 hover:text-white/70">Refresh location</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SosCard;
