import React, { Suspense, lazy, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, MapPin, Navigation, Phone, ShieldAlert, Wifi, WifiOff, Compass, Route, CloudDownload, Map as MapIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Btn, BtnGhost } from "../components/bento/tiles";
import { formatPKR } from "../../utils/currency";
import { timeAgo } from "../../utils/datetime";
import useOfflinePack from "../../hooks/useOfflinePack";
import useOnline from "../../hooks/useOnline";
import { removePack } from "../../utils/offlineStore";

const EASE = [0.16, 1, 0.3, 1];
const TYPE_LABEL = { spot: "Spot", guide: "Guide", hotel: "Stay", tour: "Tour" };

const ExploreMap = lazy(() => import("../../components/ExploreMap"));

// Local boundary so a failed map chunk (e.g. never cached before going offline)
// degrades to a note instead of taking down the whole offline page.
class MapBoundary extends React.Component {
  constructor(p) { super(p); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

const dirLink = ([lat, lng]) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const OfflineTrip = () => {
  const pack = useOfflinePack();
  const online = useOnline();

  const grouped = useMemo(() => {
    const items = pack?.items || [];
    const g = {};
    items.forEach((i) => { const d = i.day || 0; (g[d] ||= []).push(i); });
    return Object.entries(g).sort((a, b) => {
      if (Number(a[0]) === 0) return 1;
      if (Number(b[0]) === 0) return -1;
      return Number(a[0]) - Number(b[0]);
    });
  }, [pack]);

  const regions = useMemo(() => (pack?.cities || []).map((c) => ({ city: c, nearbyPlaces: [] })), [pack]);

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Eyebrow><CloudDownload className="h-3.5 w-3.5" /> Offline</Eyebrow>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              Offline <span className="text-lime-400">trip</span>
            </h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${online ? "bg-lime-400/15 text-lime-300" : "bg-amber-400/15 text-amber-300"}`}>
              {online ? <><Wifi className="h-3.5 w-3.5" /> Online</> : <><WifiOff className="h-3.5 w-3.5" /> Offline — showing saved copy</>}
            </span>
          </div>
          <p className="mt-3 max-w-xl text-lg text-white/70">Your saved itinerary, map and safety info — available with no signal.</p>
        </motion.div>

        {!pack ? (
          <Tile className="mt-8 flex flex-col items-center py-16 text-center" pad="p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-night-700 text-lime-400"><Download className="h-6 w-6" /></span>
            <h2 className="mt-4 text-lg font-extrabold text-white">Nothing downloaded yet</h2>
            <p className="mt-2 max-w-sm text-sm text-white/60">Build a trip, then tap "Download for offline" to save it here for when you lose signal in the mountains.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/trip"><Btn><Route className="h-4 w-4" /> Open Trip Builder</Btn></Link>
              <Link to="/destinations"><BtnGhost><Compass className="h-4 w-4" /> Explore</BtnGhost></Link>
            </div>
          </Tile>
        ) : (
          <>
            {/* Meta + manage */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/60">
                <span className="font-bold text-white">{pack.itemCount}</span> item(s) across{" "}
                <span className="font-bold text-white">{pack.cities.length}</span> town(s) · saved{" "}
                <span className="font-bold text-lime-400">{timeAgo(pack.builtAt)}</span>
              </p>
              <div className="flex gap-2">
                <Link to="/trip"><BtnGhost className="!px-4 !py-2.5"><Route className="h-4 w-4" /> Edit trip</BtnGhost></Link>
                <BtnGhost onClick={() => removePack()} className="!px-4 !py-2.5 hover:!border-rose-400 hover:!text-rose-400">Remove download</BtnGhost>
              </div>
            </div>

            {/* Emergency numbers — always usable, even offline */}
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-rose-400"><ShieldAlert className="h-4 w-4" /> Emergency</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {(pack.emergency || []).map((e) => (
                  <a key={e.number} href={`tel:${e.number}`} className="rounded-xl border border-white/10 bg-night-800 px-3 py-2.5 transition-colors hover:border-rose-400/60">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-white"><Phone className="h-3.5 w-3.5 text-rose-400" /> {e.number}</p>
                    <p className="mt-0.5 truncate text-[0.7rem] text-white/50">{e.label}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Map (tiles pre-cached for the trip's towns) */}
            {regions.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-lime-400"><MapIcon className="h-4 w-4" /> Map</h3>
                <MapBoundary fallback={
                  <Tile pad="p-6" className="text-sm text-white/60">Map isn't available offline — reopen this page once with signal to save it.</Tile>
                }>
                  <Suspense fallback={<Tile pad="p-6" className="text-sm text-white/50">Loading map…</Tile>}>
                    <ExploreMap regions={regions} height="46vh" />
                  </Suspense>
                </MapBoundary>
              </div>
            )}

            {/* Region safety notes */}
            {(pack.safety || []).length > 0 && (
              <div className="mt-8 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-amber-400"><ShieldAlert className="h-4 w-4" /> Local safety</h3>
                {pack.safety.map((s) => (
                  <Tile key={s.region} pad="p-4 sm:p-5">
                    <p className="text-sm font-bold text-white">{s.region}</p>
                    {s.note && <p className="mt-1 text-sm text-white/70">{s.note}</p>}
                    {Array.isArray(s.hospitals) && s.hospitals.length > 0 && (
                      <p className="mt-2 text-xs text-white/50"><span className="font-semibold text-white/70">Nearest hospitals:</span> {s.hospitals.join(" · ")}</p>
                    )}
                  </Tile>
                ))}
              </div>
            )}

            {/* Day-by-day itinerary */}
            <div className="mt-8 space-y-6">
              {grouped.map(([day, dayItems]) => (
                <div key={day}>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-lime-400">
                    <MapIcon className="h-4 w-4" /> {Number(day) === 0 ? "Unscheduled" : `Day ${day}`}
                    <span className="text-white/30">·</span><span className="font-medium text-white/40">{dayItems.length} item(s)</span>
                  </h3>
                  <div className="space-y-3">
                    {dayItems.map((it) => (
                      <Tile key={`${it.type}:${it.id}`} pad="p-0" className="overflow-hidden">
                        <div className="flex items-center gap-4">
                          <div className="h-20 w-24 shrink-0 overflow-hidden">
                            {it.image ? <img loading="lazy" decoding="async" src={it.image} alt={it.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-night-700 text-white/25"><Compass className="h-6 w-6" /></div>}
                          </div>
                          <div className="min-w-0 flex-1 py-2">
                            <span className="rounded-full bg-night-700 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white/60">{TYPE_LABEL[it.type] || it.type}</span>
                            <p className="mt-1 block truncate text-sm font-bold text-white">{it.title}</p>
                            {it.city && <p className="flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3 w-3" /> {it.city}</p>}
                          </div>
                          <div className="flex shrink-0 items-center gap-2 pr-3">
                            {it.price ? <span className="hidden text-sm font-extrabold text-white sm:block">{formatPKR(it.price)}</span> : null}
                            {it.coords && (
                              <a href={dirLink(it.coords)} target="_blank" rel="noopener noreferrer" title={`Directions to ${it.city}`} className="flex h-8 items-center gap-1 rounded-lg border border-white/12 bg-night-800 px-2.5 text-xs font-semibold text-white transition-colors hover:border-lime-400/60 hover:text-lime-300">
                                <Navigation className="h-3.5 w-3.5" /> Directions
                              </a>
                            )}
                          </div>
                        </div>
                      </Tile>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OfflineTrip;
