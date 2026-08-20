import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MapPin, Trash2, ArrowUpRight, Compass, Plus, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Chip } from "../components/bento/tiles";
import useWishlist from "../../hooks/useWishlist";
import useTrip from "../../hooks/useTrip";
import { formatPKR } from "../../utils/currency";

const EASE = [0.16, 1, 0.3, 1];
const TYPE_LABEL = { spot: "Spots", guide: "Guides", hotel: "Stays", tour: "Tours" };
const FILTERS = ["all", "spot", "guide", "hotel", "tour"];

const Wishlist = () => {
  const { items, remove } = useWishlist();
  const { toggle: toggleTrip, isInTrip } = useTrip();
  const [filter, setFilter] = React.useState("all");

  const shown = filter === "all" ? items : items.filter((i) => i.type === filter);
  const count = (t) => (t === "all" ? items.length : items.filter((i) => i.type === t).length);

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Eyebrow><Heart className="h-3.5 w-3.5" /> Saved for later</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            Your <span className="text-lime-400">wishlist</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/70">Everything you've hearted — spots, guides, stays and tours in one place.</p>
        </motion.div>

        {items.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : TYPE_LABEL[f]} <span className="ml-1 opacity-60">{count(f)}</span>
              </Chip>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <Tile className="mt-8 flex flex-col items-center py-16 text-center" pad="p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-night-700 text-lime-400"><Heart className="h-6 w-6" /></span>
            <h2 className="mt-4 text-lg font-extrabold text-white">Nothing saved yet</h2>
            <p className="mt-2 max-w-sm text-sm text-white/60">Tap the heart on any spot, guide, stay or tour to save it here.</p>
            <Link to="/destinations" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5">
              <Compass className="h-4 w-4" /> Start exploring
            </Link>
          </Tile>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((it, i) => (
              <motion.div key={`${it.type}:${it.id}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04, ease: EASE }}>
                <Tile pad="p-0" className="flex h-full flex-col overflow-hidden">
                  <Link to={it.href || "#"} className="group relative block h-36 w-full overflow-hidden">
                    {it.image ? (
                      <img loading="lazy" decoding="async" src={it.image} alt={it.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-night-700 text-white/25"><Compass className="h-8 w-8" /></div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-night-950/60 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-lime-300 backdrop-blur">
                      {(TYPE_LABEL[it.type] || it.type).replace(/s$/, "")}
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <Link to={it.href || "#"} className="text-sm font-bold text-white hover:text-lime-400">{it.title}</Link>
                    {it.city && <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3 w-3" /> {it.city}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      {it.price ? <span className="text-sm font-extrabold text-white">{formatPKR(it.price)}</span> : <span />}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleTrip(it)}
                          title={isInTrip(it.type, it.id) ? "In trip" : "Add to trip"}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isInTrip(it.type, it.id) ? "bg-lime-400 text-night-950" : "text-white/70 hover:bg-white/10"}`}
                        >
                          {isInTrip(it.type, it.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </button>
                        <Link to={it.href || "#"} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10" title="View"><ArrowUpRight className="h-4 w-4" /></Link>
                        <button onClick={() => remove(it.type, it.id)} title="Remove" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </Tile>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
