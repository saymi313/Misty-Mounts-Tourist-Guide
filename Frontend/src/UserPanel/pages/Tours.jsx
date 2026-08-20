import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, CalendarDays, Compass, ChevronLeft, ChevronRight, ArrowRight, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, inputCls } from "../components/bento/tiles";
import WishlistButton from "../../components/WishlistButton";
import AddToTripButton from "../../components/AddToTripButton";
import { listTours } from "../../data/toursApi";
import { formatPKR } from "../../utils/currency";
import { LIVE } from "../../data/api";

const EASE = [0.16, 1, 0.3, 1];
const PER_PAGE = 6;

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!LIVE) { setLoading(false); return; }
    listTours().then(setTours).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cities = useMemo(() => ["all", ...new Set(tours.flatMap((t) => t.cities || []).filter(Boolean))], [tours]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tours.filter((t) => {
      if (q) {
        const hay = [t.title, t.summary, ...(t.cities || []), t.agency?.name].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (city !== "all" && !(t.cities || []).includes(city)) return false;
      return true;
    });
  }, [tours, query, city]);

  useEffect(() => { setPage(1); }, [query, city]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageClamped = Math.min(page, totalPages);
  const shown = filtered.slice((pageClamped - 1) * PER_PAGE, pageClamped * PER_PAGE);

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-6 pt-6 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Eyebrow><Compass className="h-3.5 w-3.5" /> Guided group trips</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            Tour <span className="text-lime-400">packages</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/70">
            Ready-made itineraries by local travel agencies — spots, stays and transport sorted. Just pick a departure and go.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tours by title, city or agency…" className={`${inputCls} pl-11`} />
          </div>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inputCls} cursor-pointer sm:w-56`}>
            {cities.map((c) => <option key={c} value={c}>{c === "all" ? "All cities" : c}</option>)}
          </select>
        </div>

        <p className="mt-6 text-sm text-white/60">
          {loading ? "Loading tours…" : (<><span className="font-bold text-white">{filtered.length}</span> tour{filtered.length !== 1 ? "s" : ""} found</>)}
        </p>

        {!loading && shown.length === 0 ? (
          <Tile className="mt-4 py-16 text-center"><p className="text-white/60">No tours match your search yet.</p></Tile>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((t, i) => {
              const departures = (t.departures || []).filter((d) => new Date(d.date) >= new Date());
              return (
                <motion.div key={t._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05, ease: EASE }}>
                  <Link to={`/tours/${t._id}`} className="group block h-full">
                    <Tile pad="p-0" className="flex h-full flex-col overflow-hidden transition-colors hover:border-lime-400/40">
                      <div className="relative h-44 w-full overflow-hidden">
                        {t.coverImage ? (
                          <img loading="lazy" decoding="async" src={t.coverImage} alt={t.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-night-700 text-white/25"><Compass className="h-8 w-8" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 to-transparent" />
                        <span className="absolute left-3 top-3 rounded-full bg-lime-400 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-night-950">
                          {t.durationDays} day{t.durationDays !== 1 ? "s" : ""}
                        </span>
                        <div className="absolute right-3 top-3 flex gap-1.5">
                          <AddToTripButton compact item={{ type: "tour", id: t._id, title: t.title, image: t.coverImage, city: (t.cities || [])[0] || "", price: t.pricePerPerson, href: `/tours/${t._id}` }} />
                          <WishlistButton floating item={{ type: "tour", id: t._id, title: t.title, image: t.coverImage, city: (t.cities || [])[0] || "", price: t.pricePerPerson, href: `/tours/${t._id}` }} />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-base font-extrabold text-white">{t.title}</h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3 w-3" /> {(t.cities || []).join(", ") || "—"}</p>
                        {t.summary && <p className="mt-2 line-clamp-2 text-sm text-white/60">{t.summary}</p>}
                        <p className="mt-3 flex items-center gap-1 text-xs text-white/40"><CalendarDays className="h-3 w-3" /> {departures.length} upcoming departure{departures.length !== 1 ? "s" : ""}</p>
                        <div className="mt-auto flex items-end justify-between pt-4">
                          <div>
                            <span className="text-lg font-extrabold text-white">{formatPKR(t.pricePerPerson)}</span>
                            <span className="text-xs text-white/40"> / person</span>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-lime-400 transition-transform group-hover:translate-x-0.5">
                            View tour <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                        {t.agency?.name && <p className="mt-2 flex items-center gap-1 text-[11px] text-white/40"><Users className="h-3 w-3" /> by {t.agency.name}</p>}
                      </div>
                    </Tile>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageClamped === 1} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors hover:border-lime-400/40 hover:text-lime-400 disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`h-10 w-10 rounded-full text-sm font-bold transition-colors ${n === pageClamped ? "bg-lime-400 text-night-950" : "border border-white/12 text-white/70 hover:border-lime-400/40"}`}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageClamped === totalPages} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors hover:border-lime-400/40 hover:text-lime-400 disabled:opacity-30" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Tours;
