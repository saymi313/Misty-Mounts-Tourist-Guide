import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Search, Loader2, MapPin, Wand2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow } from "../components/bento/tiles";
import Seo from "../../components/Seo";
import { getAllSpots } from "../../data/mockApi";
import { flattenSpots } from "../../utils/tripPlanner";
import { ensureEmbeddings, semanticRank } from "../../utils/semanticSearch";

const EXAMPLES = [
  "peaceful turquoise lake away from crowds",
  "challenging high-altitude trek with glaciers",
  "green meadows perfect for families",
  "ancient forts and old villages",
];

const toItem = (s) => ({
  id: s._id,
  text: `${s.name}. ${s.city}. ${s.description || ""} ${(s.activities || []).join(", ")}`,
  spot: s,
});

const Discover = () => {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | warming | ready
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [embedded, setEmbedded] = useState(null);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const run = async (q) => {
    const text = (q ?? query).trim();
    if (!text) return;
    setError("");
    setSearching(true);
    try {
      let items = embedded;
      if (!items) {
        setPhase("warming");
        const spots = flattenSpots(await getAllSpots()).filter((s) => s._id && s.name);
        items = await ensureEmbeddings(spots.map(toItem), (done, total) => setProgress({ done, total }));
        setEmbedded(items);
        setPhase("ready");
      }
      setResults(await semanticRank(text, items, 12));
    } catch (e) {
      console.error(e);
      setError("The AI search engine couldn't load. Please check your connection and try again.");
      setPhase("idle");
    } finally {
      setSearching(false);
    }
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Seo title="Discover by vibe" description="Search Northern Pakistan by meaning — describe the trip you want and find matching spots with AI." />
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        <header className="mb-6 text-center">
          <Eyebrow className="justify-center"><Sparkles className="h-3.5 w-3.5" /> AI vibe search</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight">
            Describe the trip. <span className="text-lime-400">We'll find it.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Search by meaning, not keywords — try "a quiet turquoise lake with no crowds". Runs entirely
            in your browser, free and private.
          </p>
        </header>

        {/* Search box */}
        <form onSubmit={(e) => { e.preventDefault(); run(); }} className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your ideal spot…"
              className="w-full rounded-full border border-white/10 bg-night-800 py-3.5 pl-12 pr-4 text-white outline-none placeholder:text-white/30 focus:border-lime-400/50"
            />
          </div>
          <button type="submit" disabled={searching || !query.trim()}
            className="flex shrink-0 items-center gap-2 rounded-full bg-lime-400 px-5 py-3.5 text-sm font-extrabold text-night-950 transition-transform hover:-translate-y-0.5 disabled:opacity-50">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Search
          </button>
        </form>

        {/* Examples */}
        {!results && phase === "idle" && (
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => { setQuery(ex); run(ex); }}
                className="rounded-full border border-white/12 bg-night-800 px-3.5 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:border-lime-400/50 hover:text-white">
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Warming up */}
        {phase === "warming" && (
          <div className="mx-auto mt-8 max-w-md text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-lime-400" />
            <p className="mt-3 text-sm text-white/70">Warming up the AI search engine (one-time)…</p>
            {progress.total > 0 && (
              <>
                <div className="mx-auto mt-3 h-1.5 w-full overflow-hidden rounded-full bg-night-700">
                  <div className="h-full bg-lime-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-white/40">Indexing spots · {progress.done}/{progress.total}</p>
              </>
            )}
          </div>
        )}

        {error && <p className="mt-6 text-center text-sm text-rose-400">{error}</p>}

        {/* Results */}
        {results && (
          <section className="mt-10">
            {results.length === 0 ? (
              <p className="text-center text-white/60">No matches yet — try describing it differently.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((r) => (
                  <Link key={r.id} to={`/city/${encodeURIComponent(r.spot.city)}/spot/${r.spot._id}`} className="group">
                    <Tile pad="p-0" className="h-full overflow-hidden">
                      <div className="relative h-40 overflow-hidden">
                        <img src={r.spot.picture} alt={r.spot.name} loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                        <span className="absolute right-2 top-2 rounded-full bg-night-950/80 px-2 py-0.5 text-[11px] font-bold text-lime-400">
                          {Math.round(r._score * 100)}% match
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-extrabold text-white group-hover:text-lime-400">{r.spot.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/45"><MapPin className="h-3 w-3" /> {r.spot.city}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-white/60">{r.spot.description || r.spot.location}</p>
                      </div>
                    </Tile>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Discover;
