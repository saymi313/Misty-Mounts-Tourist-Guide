import React from "react";
import { ShieldCheck, CalendarClock, LifeBuoy } from "lucide-react";

/**
 * The Misty Guarantee — the trust promise shown at booking. Claims map to real
 * platform behaviour: payments are verified/held before a booking is confirmed,
 * bookings are managed from My Bookings, and travellers have SOS + local guides.
 */
const POINTS = [
  { icon: ShieldCheck, title: "Protected payments", body: "Your payment is verified and held before your booking is confirmed." },
  { icon: CalendarClock, title: "Flexible booking", body: "Manage or cancel your booking anytime from My Bookings." },
  { icon: LifeBuoy, title: "Help on the ground", body: "One-tap SOS, live hazard alerts and local guides on call." },
];

const MistyGuarantee = ({ className = "" }) => (
  <div className={`rounded-2xl border border-lime-400/20 bg-lime-400/[0.05] p-5 ${className}`}>
    <p className="flex items-center gap-2 text-sm font-extrabold text-white">
      <ShieldCheck className="h-4 w-4 text-lime-400" /> The Misty Guarantee
    </p>
    <ul className="mt-3 space-y-3">
      {POINTS.map((p) => {
        const Icon = p.icon;
        return (
          <li key={p.title} className="flex gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
            <span>
              <span className="block text-sm font-bold text-white">{p.title}</span>
              <span className="block text-xs leading-relaxed text-white/55">{p.body}</span>
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);

export default MistyGuarantee;
