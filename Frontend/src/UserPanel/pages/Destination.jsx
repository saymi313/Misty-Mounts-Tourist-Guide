import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllSpots } from '../../data/mockApi';
import useCities from '../../hooks/useCities';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import { Tile, Eyebrow, inputCls } from '../components/bento/tiles';
import { provinceOf, PROVINCE_ORDER } from '../../data/geo';

const EASE = [0.16, 1, 0.3, 1];
const PER_PAGE = 9;
const SORTS = [
  ['featured', 'Featured'],
  ['name', 'Name A-Z'],
  ['spots', 'Most spots'],
];

/** One city tile in the directory grid. */
const CityCard = ({ city, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.5, delay, ease: EASE }}
  >
    <Link
      to={`/destinations/${encodeURIComponent(city.name)}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-night-800"
    >
      <img
        src={city.photo || 'https://picsum.photos/seed/mm-city/800/600'}
        alt={city.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.07]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/35 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-night-950/60 px-2.5 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">
        {city.province}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-xl font-extrabold leading-tight text-white">{city.name}</h3>
        <p className="mt-0.5 text-sm text-white/60">
          {city.count} {city.count === 1 ? 'spot' : 'spots'}{city.tagline ? ` · ${city.tagline}` : ''}
        </p>
      </div>
    </Link>
  </motion.div>
);

const Destination = () => {
  const [allSpots, setAllSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminCities = useCities();
  const cityPhotos = useMemo(
    () => Object.fromEntries(adminCities.filter((c) => c.photo).map((c) => [c.name, c.photo])),
    [adminCities]
  );
  const cityTaglines = useMemo(
    () => Object.fromEntries(adminCities.filter((c) => c.tagline).map((c) => [c.name, c.tagline])),
    [adminCities]
  );

  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('all');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const spots = await getAllSpots();
        setAllSpots(Array.isArray(spots) ? spots : []);
      } catch {
        setError('Failed to load destinations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Spot counts + fallback imagery, keyed by city name.
  const spotMeta = useMemo(() => {
    const m = {};
    allSpots.forEach((c) => {
      if (c.city) m[c.city] = { count: c.nearbyPlaces?.length || 0, hero: c.heroImage, firstPic: c.nearbyPlaces?.[0]?.picture };
    });
    return m;
  }, [allSpots]);

  // The directory is driven by the admin-managed city registry (Settings page).
  // Falls back to spot-derived cities if the registry is empty (e.g. dummy mode).
  const cities = useMemo(() => {
    if (adminCities.length) {
      return adminCities.map((c) => ({
        name: c.name,
        province: c.province || provinceOf(c.name),
        photo: c.photo || spotMeta[c.name]?.hero || spotMeta[c.name]?.firstPic || '',
        tagline: c.tagline || '',
        count: spotMeta[c.name]?.count || 0,
      }));
    }
    return allSpots.filter((c) => c.city).map((c) => ({
      name: c.city,
      province: provinceOf(c.city),
      photo: cityPhotos[c.city] || c.heroImage || c.nearbyPlaces?.[0]?.picture || '',
      tagline: cityTaglines[c.city] || c.tagline || '',
      count: c.nearbyPlaces?.length || 0,
    }));
  }, [adminCities, allSpots, spotMeta, cityPhotos, cityTaglines]);

  // Provinces present, ordered, with counts (for the sidebar).
  const provinceCounts = useMemo(() => {
    const m = {};
    cities.forEach((c) => { m[c.province] = (m[c.province] || 0) + 1; });
    return m;
  }, [cities]);
  const provinces = useMemo(
    () => PROVINCE_ORDER.filter((p) => provinceCounts[p]),
    [provinceCounts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = cities.filter((c) => {
      if (province !== 'all' && c.province !== province) return false;
      if (q && !(c.name.toLowerCase().includes(q) || c.province.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q))) return false;
      return true;
    });
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'spots') list = [...list].sort((a, b) => b.count - a.count);
    return list;
  }, [cities, query, province, sort]);

  // Reset to page 1 whenever the filters change.
  useEffect(() => { setPage(1); }, [query, province, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageClamped = Math.min(page, totalPages);
  const shown = filtered.slice((pageClamped - 1) * PER_PAGE, pageClamped * PER_PAGE);

  const resetAll = () => { setQuery(''); setProvince('all'); setSort('featured'); };

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:pt-14">
        {/* Header */}
        <header className="max-w-2xl">
          <Eyebrow>Destinations</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight">
            Every corner of <span className="text-lime-400">Pakistan.</span>
          </h1>
          <p className="mt-4 text-white/60">
            Browse destinations across the country, from the peaks of Gilgit-Baltistan to the valleys of Azad Jammu &amp; Kashmir. Pick a city to explore its spots.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
          {/* ── Sidebar filters ─────────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Tile pad="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-white/50">Province</p>
                {(province !== 'all' || sort !== 'featured' || query) && (
                  <button onClick={resetAll} className="text-xs font-semibold text-white/40 transition-colors hover:text-lime-400">Reset</button>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => setProvince('all')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    province === 'all' ? 'bg-lime-400/10 text-lime-400' : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  All Pakistan <span className="text-xs text-white/40">{cities.length}</span>
                </button>
                {provinces.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvince(p)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                      province === p ? 'bg-lime-400/10 text-lime-400' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{p}</span> <span className="text-xs text-white/40">{provinceCounts[p]}</span>
                  </button>
                ))}
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-white/50">Sort by</p>
              <div className="mt-3 space-y-1">
                {SORTS.map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSort(v)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                      sort === v ? 'bg-lime-400/10 text-lime-400' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Tile>
          </aside>

          {/* ── Cities grid + pagination ────────────────────────────────── */}
          <div>
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cities and locations…"
                className={`${inputCls} pl-11`}
              />
            </div>

            {!isLoading && !error && (
              <p className="mt-4 text-sm text-white/55">
                {filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'}
                {province !== 'all' ? ` in ${province}` : ''}
              </p>
            )}

            {error ? (
              <Tile className="mt-4 py-16 text-center"><p className="text-white/70">{error}</p></Tile>
            ) : isLoading ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-[1.4rem] border border-white/[0.07] bg-night-800" />
                ))}
              </div>
            ) : shown.length === 0 ? (
              <Tile className="mt-4 flex flex-col items-center py-16 text-center">
                <p className="text-white/60">No destinations match your search.</p>
                <button onClick={resetAll} className="mt-4 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5">
                  Reset filters
                </button>
              </Tile>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((c, i) => <CityCard key={c.name} city={c} delay={Math.min(i, 6) * 0.04} />)}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pageClamped === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-lime-400/50 hover:text-lime-400 disabled:opacity-30"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`h-9 min-w-9 rounded-full px-3 text-sm font-bold transition-colors ${
                          n === pageClamped ? 'bg-lime-400 text-night-950' : 'border border-white/10 text-white/70 hover:border-lime-400/50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={pageClamped === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-lime-400/50 hover:text-lime-400 disabled:opacity-30"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Destination;
