import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Map as MapIcon, MapPin, Trash2, Share2, Check, Compass, Route, Download, X, CloudDownload, WifiOff } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Btn, BtnGhost } from "../components/bento/tiles";
import useTrip from "../../hooks/useTrip";
import useOfflinePack from "../../hooks/useOfflinePack";
import useOnline from "../../hooks/useOnline";
import { buildPack } from "../../utils/offlineStore";
import { formatPKR } from "../../utils/currency";
import { timeAgo } from "../../utils/datetime";
import { toast } from "../../utils/toast";

const EASE = [0.16, 1, 0.3, 1];
const TYPE_LABEL = { spot: "Spot", guide: "Guide", hotel: "Stay", tour: "Tour" };
const DAY_OPTS = Array.from({ length: 14 }, (_, i) => i + 1);

const encodePlan = (items) => {
  try { return btoa(encodeURIComponent(JSON.stringify(items.map(({ type, id, title, image, city, price, href, day }) => ({ type, id, title, image, city, price, href, day }))))); }
  catch { return ""; }
};
const decodePlan = (s) => {
  try { return JSON.parse(decodeURIComponent(atob(s))); } catch { return null; }
};

const TripBuilder = () => {
  const { items, remove, setDay, clear, setAll } = useTrip();
  const pack = useOfflinePack();
  const online = useOnline();
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [params, setParams] = useSearchParams();
  const sharedPlan = useMemo(() => (params.get("plan") ? decodePlan(params.get("plan")) : null), [params]);

  const downloadOffline = async () => {
    if (!online) { toast.error("Connect to the internet to download your trip."); return; }
    setSaving(true);
    try {
      await buildPack(items, setProgress);
      toast.success("Trip saved for offline — open it anytime with no signal.");
    } catch { toast.error("Couldn't save the trip offline."); }
    finally { setSaving(false); setProgress(null); }
  };

  const total = items.reduce((s, i) => s + (Number(i.price) || 0), 0);

  const grouped = useMemo(() => {
    const g = {};
    items.forEach((i) => { const d = i.day || 0; (g[d] ||= []).push(i); });
    return Object.entries(g).sort((a, b) => {
      if (Number(a[0]) === 0) return 1; // unscheduled last
      if (Number(b[0]) === 0) return -1;
      return Number(a[0]) - Number(b[0]);
    });
  }, [items]);

  const share = async () => {
    const url = `${window.location.origin}/trip?plan=${encodePlan(items)}`;
    try { await navigator.clipboard.writeText(url); toast.success("Trip link copied — share it with anyone."); }
    catch { toast.error("Couldn't copy the link."); }
  };

  const importShared = () => {
    if (sharedPlan) { setAll(sharedPlan); setParams({}, { replace: true }); toast.success("Shared trip loaded."); }
  };

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Eyebrow><Route className="h-3.5 w-3.5" /> Plan your trip</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            Trip <span className="text-lime-400">builder</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/70">Add spots, guides, stays and tours, arrange them by day, then share your plan.</p>
        </motion.div>

        {/* Import shared trip banner */}
        {sharedPlan && (
          <Tile className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between" pad="p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm text-white/80"><Download className="h-4 w-4 text-lime-400" /> Someone shared a trip with <span className="font-bold text-white">{sharedPlan.length}</span> item(s).</p>
            <div className="flex gap-2">
              <Btn onClick={importShared} className="!px-5 !py-2.5">Load this trip</Btn>
              <BtnGhost onClick={() => setParams({}, { replace: true })} className="!px-4 !py-2.5"><X className="h-4 w-4" /> Dismiss</BtnGhost>
            </div>
          </Tile>
        )}

        {items.length === 0 ? (
          <Tile className="mt-8 flex flex-col items-center py-16 text-center" pad="p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-night-700 text-lime-400"><Route className="h-6 w-6" /></span>
            <h2 className="mt-4 text-lg font-extrabold text-white">Your trip is empty</h2>
            <p className="mt-2 max-w-sm text-sm text-white/60">Browse destinations, guides and tours and tap "Add to trip" to start planning.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/destinations"><Btn><Compass className="h-4 w-4" /> Explore spots</Btn></Link>
              <Link to="/tours"><BtnGhost>Browse tours</BtnGhost></Link>
            </div>
          </Tile>
        ) : (
          <>
            {/* Toolbar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/60"><span className="font-bold text-white">{items.length}</span> item(s) · est. <span className="font-bold text-lime-400">{formatPKR(total)}</span></p>
              <div className="flex flex-wrap gap-2">
                <Btn onClick={downloadOffline} disabled={saving} className="!px-4 !py-2.5">
                  <CloudDownload className="h-4 w-4" />
                  {saving ? (progress?.total ? `Saving ${progress.done}/${progress.total}…` : "Saving…") : "Download offline"}
                </Btn>
                <BtnGhost onClick={share} className="!px-4 !py-2.5"><Share2 className="h-4 w-4" /> Share</BtnGhost>
                <BtnGhost onClick={() => { clear(); toast.success("Trip cleared."); }} className="!px-4 !py-2.5 hover:!border-rose-400 hover:!text-rose-400"><Trash2 className="h-4 w-4" /> Clear</BtnGhost>
              </div>
            </div>

            {/* Offline availability status */}
            {pack && (
              <Tile className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between" pad="p-3 sm:p-4">
                <p className="flex items-center gap-2 text-sm text-white/80">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400/15 text-lime-300"><Check className="h-4 w-4" /></span>
                  Saved for offline · <span className="text-white/50">{pack.itemCount} item(s), {pack.cities.length} town(s), updated {timeAgo(pack.builtAt)}</span>
                </p>
                <Link to="/trip/offline"><BtnGhost className="!px-4 !py-2"><WifiOff className="h-4 w-4" /> View offline trip</BtnGhost></Link>
              </Tile>
            )}

            {/* Days */}
            <div className="mt-6 space-y-6">
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
                          <Link to={it.href || "#"} className="h-20 w-24 shrink-0 overflow-hidden">
                            {it.image ? <img loading="lazy" decoding="async" src={it.image} alt={it.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-night-700 text-white/25"><Compass className="h-6 w-6" /></div>}
                          </Link>
                          <div className="min-w-0 flex-1 py-2">
                            <span className="rounded-full bg-night-700 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white/60">{TYPE_LABEL[it.type] || it.type}</span>
                            <Link to={it.href || "#"} className="mt-1 block truncate text-sm font-bold text-white hover:text-lime-400">{it.title}</Link>
                            {it.city && <p className="flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3 w-3" /> {it.city}</p>}
                          </div>
                          <div className="flex shrink-0 items-center gap-2 pr-3">
                            {it.price ? <span className="hidden text-sm font-extrabold text-white sm:block">{formatPKR(it.price)}</span> : null}
                            <select
                              value={it.day || 0}
                              onChange={(e) => setDay(it.type, it.id, e.target.value)}
                              className="rounded-lg border border-white/12 bg-night-800 px-2 py-1.5 text-xs text-white outline-none focus:border-lime-400/60"
                              title="Assign to a day"
                            >
                              <option value={0}>Unscheduled</option>
                              {DAY_OPTS.map((d) => <option key={d} value={d}>Day {d}</option>)}
                            </select>
                            <button onClick={() => remove(it.type, it.id)} title="Remove" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
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

export default TripBuilder;
