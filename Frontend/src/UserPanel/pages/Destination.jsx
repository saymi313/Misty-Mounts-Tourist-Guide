import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { getCities, getSpotsByCity } from '../../data/mockApi';
import Navbar from '../components/Navbar';
import CityCard from '../components/Destinations/CityCard';
import Footer from '../components/Home/Footer';
import { Tile, Eyebrow, SectionHead, Chip, inputCls } from '../components/bento/tiles';

const EASE = [0.16, 1, 0.3, 1];

const parseElev = (s) => parseInt(String(s || '').replace(/[^\d]/g, ''), 10) || 0;
const ELEV_BANDS = {
  any: () => true,
  low: (n) => n > 0 && n < 2500,
  mid: (n) => n >= 2500 && n <= 3500,
  high: (n) => n > 3500,
};
const ELEV_OPTS = [
  ['any', 'Any elevation'],
  ['low', 'Below 2,500 m'],
  ['mid', '2,500–3,500 m'],
  ['high', 'Above 3,500 m'],
];
const SORT_OPTS = [
  ['featured', 'Featured'],
  ['name', 'Name A–Z'],
  ['elev-desc', 'Highest first'],
  ['elev-asc', 'Lowest first'],
];

/** Bento span for a spot tile — one big featured tile + smaller ones, packed. */
const spanFor = (i, total) => {
  if (i === 0) {
    if (total >= 3) return 'sm:col-span-2 sm:row-span-2 min-h-[280px] sm:min-h-[300px]';
    if (total === 2) return 'sm:col-span-2 min-h-[280px]';
    return 'sm:col-span-3 min-h-[320px]';
  }
  return 'min-h-[200px]';
};

const Destination = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [cityData, setCityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search + advanced filters
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selActivities, setSelActivities] = useState([]);
  const [elevBand, setElevBand] = useState('any');
  const [gemsOnly, setGemsOnly] = useState(false);
  const [sort, setSort] = useState('featured');

  const clearFilters = () => {
    setSelActivities([]);
    setElevBand('any');
    setGemsOnly(false);
    setSort('featured');
    setQuery('');
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getCities();
        setCities(data);
        if (data.length > 0) setSelectedCity(data[0]);
      } catch {
        setError('Failed to load regions. Please try again later.');
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCity) return;
    setIsLoading(true);
    getSpotsByCity(selectedCity)
      .then((data) => setCityData(data))
      .catch(() => setError('Failed to load spots for this region.'))
      .finally(() => setIsLoading(false));
  }, [selectedCity]);

  const places = cityData?.nearbyPlaces || [];

  // Activities available in the current region.
  const allActivities = useMemo(() => {
    const set = new Set();
    places.forEach((p) => (p.activities || []).forEach((a) => set.add(a)));
    return Array.from(set);
  }, [places]);

  const toggleActivity = (a) =>
    setSelActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = places.filter((p) => {
      if (q && !(p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))) return false;
      if (gemsOnly && !p.hiddenGem) return false;
      if (selActivities.length && !selActivities.some((a) => (p.activities || []).includes(a))) return false;
      if (elevBand !== 'any' && !ELEV_BANDS[elevBand](parseElev(p.elevation))) return false;
      return true;
    });
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'elev-asc') list = [...list].sort((a, b) => parseElev(a.elevation) - parseElev(b.elevation));
    else if (sort === 'elev-desc') list = [...list].sort((a, b) => parseElev(b.elevation) - parseElev(a.elevation));
    return list;
  }, [places, query, gemsOnly, selActivities, elevBand, sort]);

  const activeCount = selActivities.length + (elevBand !== 'any' ? 1 : 0) + (gemsOnly ? 1 : 0) + (sort !== 'featured' ? 1 : 0);
  const hiddenGems = filtered.filter((p) => p.hiddenGem);

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-5 pb-4 pt-6 sm:px-8 lg:space-y-10">
        {/* ── Region banner ─────────────────────────────────────────────── */}
        <motion.section
          key={cityData?.heroImage || selectedCity}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden rounded-[1.8rem] border border-white/[0.07] bg-night-800"
        >
          <img
            src={cityData?.heroImage || 'https://picsum.photos/seed/mm-region/1600/900'}
            alt={selectedCity}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/50 to-night-950/20" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="relative flex min-h-[360px] flex-col justify-end px-6 py-10 sm:min-h-[440px] sm:px-12 sm:py-14">
            <Eyebrow>
              <Compass className="h-3.5 w-3.5" /> Discover Northern Pakistan
            </Eyebrow>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              {selectedCity || (
                <>
                  Explore the <span className="text-lime-400">north</span>
                </>
              )}
            </h1>
            {cityData?.tagline && <p className="mt-3 max-w-xl text-white/70">{cityData.tagline}</p>}
          </div>
        </motion.section>

        {/* ── Region chips + search + filters toggle ────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Chip
                key={city}
                active={selectedCity === city}
                onClick={() => {
                  setSelectedCity(city);
                  clearFilters();
                }}
              >
                {city}
              </Chip>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search spots by name, place or description…"
                className={`${inputCls} pl-11`}
              />
            </div>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-colors ${
                showFilters || activeCount
                  ? 'border-lime-400/50 bg-lime-400/10 text-lime-300'
                  : 'border-white/10 bg-night-800 text-white/70 hover:border-lime-400/40'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-lime-400 px-1 text-[11px] font-bold text-night-950">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Advanced filters panel ──────────────────────────────────── */}
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="overflow-hidden"
              >
                <Tile pad="p-5 sm:p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-white/50">Activities</p>
                      <div className="flex flex-wrap gap-2">
                        {allActivities.length ? (
                          allActivities.map((a) => (
                            <Chip key={a} active={selActivities.includes(a)} onClick={() => toggleActivity(a)}>
                              {a}
                            </Chip>
                          ))
                        ) : (
                          <span className="text-sm text-white/40">No activities listed for this region.</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-white/50">Elevation</p>
                      <div className="flex flex-wrap gap-2">
                        {ELEV_OPTS.map(([v, l]) => (
                          <Chip key={v} active={elevBand === v} onClick={() => setElevBand(v)}>
                            {l}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-4 border-t border-white/8 pt-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-white/50">Sort by</p>
                      <div className="flex flex-wrap gap-2">
                        {SORT_OPTS.map(([v, l]) => (
                          <Chip key={v} active={sort === v} onClick={() => setSort(v)}>
                            {l}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-end gap-3 sm:ml-auto">
                      <Chip active={gemsOnly} onClick={() => setGemsOnly((g) => !g)}>
                        Hidden gems only
                      </Chip>
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white/50 transition-colors hover:text-lime-400"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                      </button>
                    </div>
                  </div>
                </Tile>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Spots bento ───────────────────────────────────────────────── */}
        <section>
          <SectionHead
            eyebrow={selectedCity ? `Spots in ${selectedCity}` : 'Where to go'}
            title="Places to explore"
            icon={Compass}
          />

          {!isLoading && !error && (
            <p className="-mt-2 mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/60">
              <span>
                Showing <span className="font-bold text-white">{filtered.length}</span> of {places.length} spots
              </span>
              {hiddenGems.length > 0 && (
                <>
                  <span className="text-white/25">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                    <span className="font-semibold text-lime-400">{hiddenGems.length} hidden gems</span>
                  </span>
                </>
              )}
            </p>
          )}

          {error ? (
            <Tile className="py-16 text-center">
              <p className="text-white/70">{error}</p>
            </Tile>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`animate-pulse rounded-[1.4rem] border border-white/[0.07] bg-night-800 ${
                    i === 0 ? 'sm:col-span-2 sm:row-span-2 min-h-[280px] sm:min-h-[300px]' : 'min-h-[200px]'
                  }`}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Tile className="flex flex-col items-center py-16 text-center">
              <p className="text-white/60">No spots match your search &amp; filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5"
              >
                <RotateCcw className="h-4 w-4" /> Reset filters
              </button>
            </Tile>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {filtered.map((place, i) => (
                <CityCard
                  key={place._id}
                  name={place.name}
                  location={place.location}
                  picture={place.picture}
                  city={selectedCity}
                  spotId={place._id}
                  hiddenGem={place.hiddenGem}
                  curatedBy={place.curatedBy}
                  className={spanFor(i, filtered.length)}
                  delay={Math.min(i, 6) * 0.05}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Destination;
