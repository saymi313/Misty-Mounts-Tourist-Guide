import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Wand2, MapPin, CalendarDays, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Chip } from "../components/bento/tiles";
import { getAllSpots } from "../../data/mockApi";
import { CITY_COORDS } from "../../data/geo";
import useTrip from "../../hooks/useTrip";
import { INTERESTS, PACE, planTrip, planToTripItems } from "../../utils/tripPlanner";

const REGIONS = ["", ...Object.keys(CITY_COORDS)];

const TripPlanner = () => {
  const navigate = useNavigate();
  const { setAll } = useTrip();

  const [days, setDays] = useState(4);
  const [interests, setInterests] = useState(["hiking", "lakes"]);
  const [pace, setPace] = useState("balanced");
  const [region, setRegion] = useState("");

  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggleInterest = (k) =>
    setInterests((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const generate = async () => {
    setBusy(true);
    try {
      const spots = await getAllSpots();
      setPlan(planTrip(spots, { days: Number(days), interests, pace, region }));
    } catch {
      setPlan({ days: [], cities: [] });
    } finally {
      setBusy(false);
    }
  };

  const addToTrip = () => {
    if (!plan) return;
    setAll(planToTripItems(plan));
    navigate("/trip");
  };

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <header className="mb-8">
          <Eyebrow><Sparkles className="h-3.5 w-3.5" /> Trip planner</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight">
            Plan your perfect trip to <span className="text-lime-400">the north.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/60">
            Tell us your days and your vibe — we'll build a day-by-day itinerary from real,
            bookable spots and drop it straight into your Trip Builder.
          </p>
        </header>

        {/* Form */}
        <Tile pad="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">How many days?</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min="1" max="14" value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-night-700 accent-lime-400"
                />
                <span className="w-16 text-right text-2xl font-extrabold text-lime-400">{days}d</span>
              </div>

              <label className="mb-2 mt-6 block text-sm font-bold text-white/70">Region</label>
              <select
                value={region} onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-night-800 px-4 py-3 text-sm text-white outline-none focus:border-lime-400/50"
              >
                {REGIONS.map((r) => <option key={r || "any"} value={r}>{r || "Anywhere in the north"}</option>)}
              </select>

              <label className="mb-2 mt-6 block text-sm font-bold text-white/70">Pace</label>
              <div className="flex gap-2">
                {Object.entries(PACE).map(([k, v]) => (
                  <button key={k} onClick={() => setPace(k)}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                      pace === k ? "bg-lime-400 text-night-950" : "bg-night-700 text-white/70 hover:bg-night-600"
                    }`}>
                    {v.label}
                    <span className="block text-[10px] font-medium opacity-70">{v.perDay}/day</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">What do you love?</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <Chip key={i.key} active={interests.includes(i.key)} onClick={() => toggleInterest(i.key)}>
                    {i.label}
                  </Chip>
                ))}
              </div>

              <button
                onClick={generate}
                disabled={busy}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3.5 text-sm font-extrabold text-night-950 transition-transform hover:-translate-y-0.5 hover:bg-lime-300 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {busy ? "Building your trip…" : plan ? "Regenerate itinerary" : "Generate my itinerary"}
              </button>
            </div>
          </div>
        </Tile>

        {/* Result */}
        {plan && (
          <section className="mt-10">
            {plan.days.length === 0 ? (
              <Tile pad="p-8" className="text-center">
                <p className="text-white/60">No spots matched that region yet. Try "Anywhere in the north" or different interests.</p>
              </Tile>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">Your {plan.days.length}-day itinerary</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/55">
                      <MapPin className="h-4 w-4 text-lime-400" /> {plan.cities.join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={generate} className="inline-flex items-center gap-2 rounded-full bg-night-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-night-600">
                      <RefreshCw className="h-4 w-4" /> Shuffle
                    </button>
                    <button onClick={addToTrip} className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-extrabold text-night-950 transition-transform hover:-translate-y-0.5 hover:bg-lime-300">
                      Add to Trip Builder <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {plan.days.map((d) => (
                    <Tile key={d.day} pad="p-5 sm:p-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-sm font-extrabold text-lime-400">
                          {d.day}
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Day {d.day}</p>
                          <h3 className="flex items-center gap-1.5 text-lg font-extrabold text-white">
                            <MapPin className="h-4 w-4 text-lime-400" /> {d.city}
                          </h3>
                        </div>
                      </div>

                      {d.spots.length ? (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {d.spots.map((s) => (
                            <Link
                              key={s._id}
                              to={`/city/${encodeURIComponent(s.city)}/spot/${s._id}`}
                              className="group flex gap-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-night-800/60 p-2.5 transition-colors hover:border-lime-400/30"
                            >
                              <img
                                src={s.picture} alt={s.name} loading="lazy"
                                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                              />
                              <span className="min-w-0 py-0.5">
                                <span className="block truncate text-sm font-bold text-white group-hover:text-lime-400">{s.name}</span>
                                <span className="mt-0.5 line-clamp-2 block text-xs text-white/45">{s.location || s.description}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-white/45">Free day — explore {d.city} at your own pace, rest, or add extra stops.</p>
                      )}
                    </Tile>
                  ))}
                </div>

                <p className="mt-6 flex items-center gap-2 text-center text-xs text-white/35">
                  <CalendarDays className="h-3.5 w-3.5" /> Built from your saved spots · edit freely in the Trip Builder, then book stays &amp; guides.
                </p>
              </>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TripPlanner;
