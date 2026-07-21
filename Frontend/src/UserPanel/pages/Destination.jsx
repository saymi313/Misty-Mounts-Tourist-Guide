import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, Compass } from 'lucide-react';
import { getCities, getSpotsByCity } from '../../data/mockApi';
import Navbar from '../components/Navbar';
import CityCard from '../components/Destinations/CityCard';
import Footer from '../components/Home/Footer';

const Destination = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [cityData, setCityData] = useState(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter(
      (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
  }, [places, query]);

  const hiddenGems = filtered.filter((p) => p.hiddenGem);

  return (
    <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
      <Navbar />

      {/* ── Region banner ─────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
          <img
            key={cityData?.heroImage}
            src={cityData?.heroImage || 'https://picsum.photos/seed/mm-region/1600/900'}
            alt={selectedCity}
            className="h-full w-full object-cover animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/40 to-abyss-950/20" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8">
              <p className="eyebrow text-glacier-300">
                <Compass className="h-3.5 w-3.5" /> Discover Northern Pakistan
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-frost-50 sm:text-6xl">
                {selectedCity || 'Explore the north'}
              </h1>
              {cityData?.tagline && (
                <p className="mt-3 max-w-xl text-frost-200/90">{cityData.tagline}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Region selector + search (sticky) ─────────────────── */}
      <div className="sticky top-[68px] z-30 border-b border-abyss-900/10 bg-frost-50/90 backdrop-blur-md dark:border-frost-50/12 dark:bg-abyss-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => { setSelectedCity(city); setQuery(''); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedCity === city
                    ? 'bg-glacier-400 text-abyss-950'
                    : 'border border-abyss-900/12 bg-white text-abyss-800 hover:border-glacier-400 hover:text-abyss-900 dark:border-frost-50/15 dark:bg-abyss-900 dark:text-frost-100 dark:hover:text-frost-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-frost-500 dark:text-frost-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search spots in this region…"
              className="w-full rounded-full border border-abyss-900/12 bg-white py-2.5 pl-11 pr-4 text-sm text-abyss-900 placeholder-frost-400 focus:border-glacier-400 focus:outline-none focus:ring-2 focus:ring-glacier-400/20 dark:border-frost-50/15 dark:bg-abyss-800 dark:text-frost-50"
            />
          </div>
        </div>
      </div>

      {/* ── Spots grid ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        {error ? (
          <p className="py-16 text-center text-clay-600">{error}</p>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl bg-white ring-1 ring-abyss-900/10 dark:bg-abyss-900 dark:ring-frost-50/10">
                <div className="h-56 animate-pulse bg-frost-100 dark:bg-abyss-800" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-frost-100 dark:bg-abyss-800" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-frost-100 dark:bg-abyss-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {hiddenGems.length > 0 && (
              <div className="mb-8 flex items-center gap-2 text-sm text-frost-600 dark:text-frost-300">
                <Sparkles className="h-4 w-4 text-glacier-600 dark:text-glacier-300" />
                <span>
                  <span className="font-semibold text-abyss-900 dark:text-frost-50">{hiddenGems.length} hidden gems</span>{' '}
                  curated by local guides in {selectedCity}
                </span>
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="py-16 text-center text-frost-500 dark:text-frost-400">
                No spots match “{query}”. Try another search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((place) => (
                  <CityCard
                    key={place._id}
                    name={place.name}
                    location={place.location}
                    picture={place.picture}
                    city={selectedCity}
                    spotId={place._id}
                    hiddenGem={place.hiddenGem}
                    curatedBy={place.curatedBy}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Destination;
