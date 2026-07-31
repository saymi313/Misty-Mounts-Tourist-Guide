import React from "react";
import { Plus, Check } from "lucide-react";
import useTrip from "../hooks/useTrip";

/**
 * "Add to trip" toggle for any content item. `item` = { type, id, title, image,
 * city, price, href }. `compact` renders an icon-only pill for card overlays.
 */
export default function AddToTripButton({ item, className = "", compact = false }) {
  const { toggle, isInTrip } = useTrip();
  const inTrip = isInTrip(item.type, item.id);

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
        aria-label={inTrip ? "Remove from trip" : "Add to trip"}
        title={inTrip ? "In your trip" : "Add to trip"}
        className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors ${inTrip ? "bg-lime-400 text-night-950" : "bg-night-950/50 text-white hover:bg-night-950/70"} ${className}`}
      >
        {inTrip ? <Check className="h-[18px] w-[18px]" /> : <Plus className="h-[18px] w-[18px]" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition-colors ${inTrip ? "border-lime-400/50 bg-lime-400/10 text-lime-300" : "border-white/20 text-white hover:border-lime-400 hover:text-lime-400"} ${className}`}
    >
      {inTrip ? <><Check className="h-4 w-4" /> In your trip</> : <><Plus className="h-4 w-4" /> Add to trip</>}
    </button>
  );
}
