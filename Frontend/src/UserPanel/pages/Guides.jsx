import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Users, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Chip, inputCls } from "../components/bento/tiles";
import { listGuides } from "../../data/guidesApi";
import { LIVE } from "../../data/api";

const EASE = [0.16, 1, 0.3, 1];
const PER_PAGE = 6;
const RATING_FILTERS = [["any", "Any rating"], ["4", "4.0+"], ["4.5", "4.5+"]];

const Stars = ({ value }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(value) ? "fill-lime-400 text-lime-400" : "fill-white/10 text-white/15"}`} />
    ))}
  </span>
);

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState("any");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!LIVE) { setLoading(false); return; }
    listGuides().then(setGuides).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cities = useMemo(() => ["all", ...new Set(guides.map((g) => g.city).filter(Boolean))], [guides]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((g) => {
      if (q) {
        const hay = [g.name, g.city, ...(g.specialties || []), ...(g.languages || []), ...(g.serviceAreas || [])]
          .join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (city !== "all" && g.city !== city) return false;
      if (minRating !== "any" && g.rating < Number(minRating)) return false;
      return true;
    });
  }, [guides, query, city, minRating]);

  useEffect(() => { setPage(1); }, [query, city, minRating]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageClamped = Math.min(page, totalPages);
  const shown = filtered.slice((pageClamped - 1) * PER_PAGE, pageClamped * PER_PAGE);

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-6 pt-6 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Eyebrow><Users className="h-3.5 w-3.5" /> Meet the locals</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            Local <span className="text-lime-400">guides</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/70">
            Find a guide who knows your valley — filter by rating and city, read reviews, then message them directly.
          </p>
        </motion.div>

        {/* Search + city */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city or specialty…"
              className={`${inputCls} pl-11`}
            />
          </div>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inputCls} cursor-pointer sm:w-56`}>
            {cities.map((c) => <option key={c} value={c}>{c === "all" ? "All cities" : c}</option>)}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {RATING_FILTERS.map(([v, l]) => (
            <Chip key={v} active={minRating === v} onClick={() => setMinRating(v)}>{l}</Chip>
          ))}
        </div>

        <p className="mt-6 text-sm text-white/60">
          {loading ? "Loading guides…" : (
            <><span className="font-bold text-white">{filtered.length}</span> guide{filtered.length !== 1 ? "s" : ""} found</>
          )}
        </p>

        {/* Grid */}
        {!loading && shown.length === 0 ? (
          <Tile className="mt-4 py-16 text-center"><p className="text-white/60">No guides match your search.</p></Tile>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((g, i) => (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05, ease: EASE }}
              >
                <Link to={`/guides/${g._id}`} className="group block h-full">
                  <Tile pad="p-5" className="flex h-full flex-col transition-colors hover:border-lime-400/40">
                    <div className="flex items-center gap-3.5">
                      {g.avatar ? (
                        <img src={g.avatar} alt={g.name} className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-lime-400/20" />
                      ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lime-400 text-xl font-extrabold text-night-950">
                          {(g.name || "G").charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold text-white">{g.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3 w-3" /> {g.city || "—"}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Stars value={g.rating} />
                          <span className="text-xs font-semibold text-white/70">{g.rating ? g.rating.toFixed(1) : "New"}</span>
                          <span className="text-xs text-white/40">({g.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                    {g.bio && <p className="mt-4 line-clamp-2 text-sm text-white/60">{g.bio}</p>}
                    {g.specialties?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {g.specialties.slice(0, 3).map((s) => (
                          <span key={s} className="rounded-full bg-night-700 px-2.5 py-0.5 text-[11px] font-medium text-white/70">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="truncate text-xs text-white/40">{g.experience || "Local guide"}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-lime-400 transition-transform group-hover:translate-x-0.5">
                        View profile <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Tile>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageClamped === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors hover:border-lime-400/40 hover:text-lime-400 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-10 w-10 rounded-full text-sm font-bold transition-colors ${n === pageClamped ? "bg-lime-400 text-night-950" : "border border-white/12 text-white/70 hover:border-lime-400/40"}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageClamped === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors hover:border-lime-400/40 hover:text-lime-400 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Guides;
