import React from "react";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import { useCountUp, Sparkline } from "./motion";

/** White rounded card container. */
export const Card = ({ className = "", children }) => (
  <div className={`rounded-3xl bg-white p-6 shadow-[0_10px_30px_-18px_rgba(20,40,30,0.25)] ${className}`}>{children}</div>
);

/** Section header with title + optional action. */
export const SectionHead = ({ title, sub, action }) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-slate-400">{sub}</p>}
    </div>
    {action}
  </div>
);

/**
 * Topographic contour motif — a brand texture (mountain contour lines) used
 * behind the sidebar / promo so the panels read as a *mountain* product.
 */
export const Contour = ({ className = "", stroke = "currentColor", opacity = 0.5 }) => (
  <svg className={className} viewBox="0 0 240 240" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <g stroke={stroke} strokeWidth="1" opacity={opacity} fill="none">
      {[0, 22, 44, 66, 88, 110, 132].map((o, i) => (
        <path
          key={i}
          d={`M-20 ${200 - o} C 40 ${150 - o}, 90 ${210 - o}, 130 ${160 - o} S 220 ${120 - o}, 260 ${150 - o}`}
        />
      ))}
    </g>
  </svg>
);

const TONES = {
  emerald: { chip: "bg-emerald-50 text-emerald-600", spark: "#10b981", sparkFill: "rgba(16,185,129,0.14)" },
  apricot: { chip: "bg-apricot-50 text-apricot-600", spark: "#e5983f", sparkFill: "rgba(229,152,63,0.16)" },
  sky: { chip: "bg-sky-50 text-sky-600", spark: "#0ea5e9", sparkFill: "rgba(14,165,233,0.14)" },
  violet: { chip: "bg-violet-50 text-violet-600", spark: "#8b5cf6", sparkFill: "rgba(139,92,246,0.14)" },
  rose: { chip: "bg-rose-50 text-rose-600", spark: "#f43f5e", sparkFill: "rgba(244,63,94,0.14)" },
};

/**
 * Stat tile. Two deliberately different treatments so the row is NOT four clones:
 * - `featured`: tinted, large count-up number in the display face + a sparkline.
 * - default (compact): white, number-led, with a subtle label and trend.
 */
export const StatCard = ({
  icon: Icon,
  label,
  value,
  count,
  prefix = "",
  suffix = "",
  decimals = 0,
  delta,
  tone = "emerald",
  featured = false,
  spark,
}) => {
  const t = TONES[tone] || TONES.emerald;
  const animated = useCountUp(count ?? 0, { decimals });
  const shown =
    count != null
      ? `${prefix}${decimals ? animated : Number(animated).toLocaleString()}${suffix}`
      : value;

  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white shadow-[0_20px_40px_-20px_rgba(6,95,70,0.6)]">
        <Contour className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-white" opacity={0.18} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/90">{label}</div>
            <div className="mt-2 font-display text-4xl font-extrabold tracking-tight">{shown}</div>
          </div>
          {delta && (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {delta}
            </span>
          )}
        </div>
        {spark && (
          <div className="relative mt-4 -mb-1 opacity-90">
            <Sparkline data={spark} stroke="#ffffff" fill="rgba(255,255,255,0.18)" w={220} h={44} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_-20px_rgba(20,40,30,0.25)]">
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.chip}`}>
          {Icon && <Icon className="h-[18px] w-[18px]" />}
        </span>
        {delta && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">{delta}</span>
        )}
      </div>
      <div className="mt-4 font-display text-2xl font-extrabold text-slate-900">{shown}</div>
      <div className="mt-0.5 text-sm text-slate-400">{label}</div>
    </div>
  );
};

/** Large image destination card with overlay (featured row). */
export const DestinationCard = ({ image, title, location, rating, onClick, className = "" }) => (
  <button onClick={onClick} className={`group relative block overflow-hidden rounded-[1.5rem] text-left shadow-sm ${className}`}>
    <img src={image} alt={title} className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/10 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
      <div>
        <h3 className="font-display text-lg font-bold text-white">{title}</h3>
        {location && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/85">
            <MapPin className="h-3.5 w-3.5" /> {location}
          </p>
        )}
      </div>
      {rating != null && (
        <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          <Star className="h-3 w-3 fill-apricot-300 text-apricot-300" /> {rating}
        </span>
      )}
    </div>
  </button>
);

/**
 * Compact list row. `hoverMeta` slides in on hover — use it to reveal a datum
 * specific to the item (elevation, price…), so the interaction is content-tied
 * rather than a generic hover-colour change.
 */
export const ListRow = ({ image, title, location, rating, right, hoverMeta, onClick }) => (
  <button onClick={onClick} className="group flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-emerald-50/60">
    {image && <img src={image} alt={title} className="h-12 w-12 shrink-0 rounded-xl object-cover" />}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
      {location && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
          <MapPin className="h-3 w-3" /> {location}
          {rating != null && (
            <>
              <span className="mx-1">·</span>
              <Star className="h-3 w-3 fill-apricot-400 text-apricot-400" /> {rating}
            </>
          )}
        </p>
      )}
    </div>
    <div className="flex items-center gap-3">
      {hoverMeta && (
        <span className="hidden -translate-x-1 items-center gap-1 whitespace-nowrap text-xs font-medium text-emerald-700 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:flex">
          {hoverMeta}
        </span>
      )}
      {right}
    </div>
  </button>
);

/** Coloured status pill. */
export const StatusPill = ({ status }) => {
  const map = {
    Confirmed: "bg-emerald-50 text-emerald-600",
    Pending: "bg-apricot-50 text-apricot-600",
    Cancelled: "bg-rose-50 text-rose-600",
    Approved: "bg-emerald-50 text-emerald-600",
    Active: "bg-emerald-50 text-emerald-600",
    Resolved: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
};

export const Btn = ({ children, className = "", ...props }) => (
  <button className={`inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 ${className}`} {...props}>
    {children}
  </button>
);

export const BtnGhost = ({ children, className = "", ...props }) => (
  <button className={`inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 ${className}`} {...props}>
    {children}
  </button>
);

/**
 * Sidebar footer promo — real photography + a topographic contour wash and an
 * apricot CTA, instead of decorative gradient blobs.
 */
export const PromoCard = ({ title, body, cta, image, onClick }) => (
  <div className="relative overflow-hidden rounded-3xl p-5 text-white">
    <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/60 to-emerald-800/30" />
    <Contour className="pointer-events-none absolute inset-0 h-full w-full text-white" opacity={0.12} />
    <div className="relative">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-white/80">{body}</p>
      <button onClick={onClick} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-apricot-400 px-3.5 py-2 text-xs font-bold text-emerald-950 transition-transform hover:scale-105">
        {cta} <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);
