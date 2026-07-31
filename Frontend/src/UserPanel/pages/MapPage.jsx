import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Map as MapIcon, MapPin, ArrowUpRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import ExploreMap from "../../components/ExploreMap";
import { Tile, Eyebrow } from "../components/bento/tiles";
import { getAllSpots } from "../../data/mockApi";
import { CITY_COORDS } from "../../data/geo";
import { LIVE } from "../../data/api";

const EASE = [0.16, 1, 0.3, 1];

const MapPage = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!LIVE) { setLoading(false); return; }
    getAllSpots()
      .then((data) => setRegions(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const mapped = regions.filter((r) => CITY_COORDS[r.city]);

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Eyebrow><MapIcon className="h-3.5 w-3.5" /> Explore the map</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            The north, <span className="text-lime-400">mapped</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/70">Tap a pin to see the spots in each region and jump straight to them.</p>
        </motion.div>

        <div className="mt-8">
          {loading ? (
            <Tile className="flex items-center justify-center" pad="p-0"><div className="h-[70vh] w-full animate-pulse rounded-[1.4rem] bg-night-800" /></Tile>
          ) : (
            <ExploreMap regions={regions} height="70vh" />
          )}
        </div>

        {/* Region quick-links */}
        {mapped.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-extrabold tracking-tight text-white">Regions on the map</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mapped.map((r) => (
                <Tile key={r.city} pad="p-5" className="transition-colors hover:border-lime-400/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="flex items-center gap-1.5 text-base font-extrabold text-white"><MapPin className="h-4 w-4 text-lime-400" /> {r.city}</h3>
                      <p className="mt-0.5 text-xs text-white/50">{(r.nearbyPlaces || []).length} spot{(r.nearbyPlaces || []).length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(r.nearbyPlaces || []).slice(0, 4).map((p) => (
                      <Link key={p._id} to={`/city/${encodeURIComponent(r.city)}/spot/${p._id}`} className="inline-flex items-center gap-1 rounded-full bg-night-700 px-2.5 py-1 text-xs font-medium text-white/75 transition-colors hover:text-lime-400">
                        {p.name} <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                </Tile>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MapPage;
