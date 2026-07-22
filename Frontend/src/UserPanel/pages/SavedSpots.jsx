import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, ArrowUpRight, Compass, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Btn } from "../components/bento/tiles";
import { allPlaces } from "../../data/mockData";
import { getSaved, toggleSaved, hydrateSaved, subscribeSaved } from "../../utils/savedStore";

const EASE = [0.16, 1, 0.3, 1];

const SavedSpots = () => {
  const navigate = useNavigate();
  const [ids, setIds] = useState(getSaved);

  useEffect(() => {
    hydrateSaved();
    return subscribeSaved(() => setIds([...getSaved()]));
  }, []);

  const spots = allPlaces.filter((p) => ids.includes(p._id));
  const unsave = (id) => {
    toggleSaved(id);
    setIds([...getSaved()]);
  };

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <Eyebrow><Heart className="h-3.5 w-3.5" /> Your collection</Eyebrow>
            <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              Saved <span className="text-lime-400">spots</span>
            </h1>
            <p className="mt-3 max-w-xl text-lg text-white/70">
              {spots.length > 0
                ? `${spots.length} place${spots.length > 1 ? "s" : ""} you're dreaming about.`
                : "Places you save will live here for easy planning."}
            </p>
          </div>
          <Link to="/destinations">
            <Btn><Compass className="h-4 w-4" /> Explore more</Btn>
          </Link>
        </motion.div>

        {spots.length === 0 ? (
          <Tile className="mt-10 flex flex-col items-center justify-center py-20 text-center" pad="p-8">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-night-700 text-lime-400">
              <Heart className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold text-white">No saved spots yet</h2>
            <p className="mt-2 max-w-sm text-sm text-white/60">
              Tap the heart on any destination to keep it here — we'll watch prices and weather for you.
            </p>
            <Link to="/destinations" className="mt-6">
              <Btn><Compass className="h-4 w-4" /> Browse destinations</Btn>
            </Link>
          </Tile>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {spots.map((p, i) => (
                <motion.div
                  key={p._id}
                  layout
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, delay: i * 0.04, ease: EASE }}
                  onClick={() => navigate(`/city/${encodeURIComponent(p.city)}/spot/${encodeURIComponent(p._id)}`)}
                  className="group relative block min-h-[260px] cursor-pointer overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-night-800"
                >
                  <img
                    src={p.picture}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/30 to-transparent" />

                  {p.hiddenGem && (
                    <span className="absolute left-3 top-3 rounded-full bg-lime-400 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-night-950">
                      Hidden gem
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      unsave(p._id);
                    }}
                    aria-label={`Remove ${p.name} from saved`}
                    title="Remove from saved"
                    className="group/rm absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-night-950/60 text-lime-400 backdrop-blur transition-colors hover:bg-rose-500 hover:text-white"
                  >
                    <Heart className="h-4 w-4 fill-current group-hover/rm:hidden" />
                    <X className="hidden h-4 w-4 group-hover/rm:block" strokeWidth={2.75} />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="flex items-center gap-1 text-xs font-medium text-lime-300">
                      <MapPin className="h-3 w-3" /> {p.location}
                    </p>
                    <h3 className="mt-0.5 text-lg font-extrabold leading-tight text-white">{p.name}</h3>
                    {p.curatedBy && (
                      <p className="mt-1 text-xs text-white/60">
                        Curated by <span className="text-lime-400">{p.curatedBy}</span>
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-lime-400 opacity-0 transition-opacity group-hover:opacity-100">
                      View spot <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SavedSpots;
