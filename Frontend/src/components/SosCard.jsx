import React, { useState } from "react";
import { Siren, MapPin, Copy, Check, Phone, Loader2, MessageCircle } from "lucide-react";

/**
 * Emergency SOS card — grabs the traveller's live GPS location (browser
 * Geolocation, no backend) and turns it into a shareable Google Maps link they
 * can send to family over WhatsApp, plus one-tap dial to Rescue 1122 / Police.
 */
const SosCard = ({ className = "" }) => {
  const [state, setState] = useState("idle"); // idle | locating | ready | error
  const [pos, setPos] = useState(null); // { lat, lng, acc }
  const [copied, setCopied] = useState(false);

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
  const message = pos
    ? `I need help. My live location: ${mapsLink} (accuracy ~${pos.acc}m). Sent via Misty Mounts.`
    : "";
  const waLink = pos ? `https://wa.me/?text=${encodeURIComponent(message)}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  return (
    <section className={`overflow-hidden rounded-3xl border border-rose-500/25 bg-rose-500/[0.06] p-6 sm:p-7 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300">
          <Siren className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-white">Emergency SOS</h2>
          <p className="text-sm text-white/55">Share your live location and reach help fast.</p>
        </div>
      </div>

      {/* Quick dial */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <a href="tel:1122" className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
          <Phone className="h-4 w-4" /> Call Rescue 1122
        </a>
        <a href="tel:15" className="flex items-center justify-center gap-2 rounded-2xl bg-night-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-night-600">
          <Phone className="h-4 w-4" /> Call Police 15
        </a>
      </div>

      {/* Location share */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-night-900/60 p-4">
        {state !== "ready" && (
          <button
            onClick={locate}
            disabled={state === "locating"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {state === "locating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {state === "locating" ? "Getting your location…" : "Share my live location"}
          </button>
        )}

        {state === "error" && (
          <p className="mt-3 text-sm text-rose-300">
            Couldn't get your location. Enable location access in your browser and try again.
          </p>
        )}

        {state === "ready" && pos && (
          <div>
            <p className="flex items-center gap-1.5 text-sm text-white/70">
              <MapPin className="h-4 w-4 text-lime-400" />
              {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
              <span className="text-white/35">· ±{pos.acc}m</span>
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-night-700 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-night-600">
                <MapPin className="h-4 w-4" /> Open map
              </a>
              <button onClick={copy}
                className="flex items-center justify-center gap-2 rounded-xl bg-night-700 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-night-600">
                {copied ? <Check className="h-4 w-4 text-lime-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button onClick={locate} className="mt-3 text-xs font-semibold text-white/40 hover:text-white/70">
              Refresh location
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SosCard;
