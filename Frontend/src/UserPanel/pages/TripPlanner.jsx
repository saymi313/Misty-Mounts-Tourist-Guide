import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:pt-14">
        {/* Header */}
        <header className="max-w-2xl">
          <Eyebrow>Trip planner</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight">
            Plan your perfect trip to <span className="text-lime-400">the north.</span>
          </h1>
          <p className="mt-4 text-white/60">
            Set your days and your vibe. We build a day-by-day itinerary from real, bookable spots and drop it into your Trip Builder.
          </p>
        </header>

        {/* Workspace: sticky control panel + live results */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
          {/* Control panel */}
          <Tile pad="p-5" className="lg:sticky lg:top-24">
            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-bold text-white/70">Trip length</label>
                <span className="text-xl font-extrabold text-lime-400">{days}<span className="text-sm">d</span></span>
              </div>
              <input
                type="range" min="1" max="14" value={days}
                onChange={(e) => setDays(e.target.value)}
                className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-night-700 accent-lime-400"
              />
              <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-white/30">
                <span>1 day</span><span>2 weeks</span>
              </div>
            </div>

            <label className="mb-2 mt-5 block text-sm font-bold text-white/70">Region</label>
            <select
              value={region} onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-night-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-lime-400/50"
            >
              {REGIONS.map((r) => <option key={r || "any"} value={r}>{r || "Anywhere in the north"}</option>)}
            </select>

            <label className="mb-2 mt-5 block text-sm font-bold text-white/70">Pace</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PACE).map(([k, v]) => (
                <button key={k} onClick={() => setPace(k)}
                  className={`rounded-lg px-2 py-2 text-xs font-bold transition-colors active:scale-[0.97] ${
                    pace === k ? "bg-lime-400 text-night-950" : "bg-night-700 text-white/70 hover:bg-night-600"
                  }`}>
                  {v.label}
                  <span className="block text-[10px] font-medium opacity-70">{v.perDay}/day</span>
                </button>
              ))}
            </div>

            <label className="mb-2 mt-5 block text-sm font-bold text-white/70">What do you love?</label>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS.map((i) => (
                <Chip key={i.key} active={interests.includes(i.key)} onClick={() => toggleInterest(i.key)} className="!px-3 !py-1.5 !text-xs">
                  {i.label}
                </Chip>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={busy}
              className="mt-6 w-full rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5 hover:bg-lime-300 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? "Building your trip" : plan ? "Regenerate" : "Build my itinerary"}
            </button>
          </Tile>

          {/* Results */}
          <div>
            {!plan && (
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-white/12 bg-night-900/40 p-10 text-center">
                <span className="h-12 w-12 rounded-full border border-white/15" />
                <h2 className="mt-5 text-lg font-extrabold text-white">Your itinerary appears here</h2>
                <p className="mt-2 max-w-sm text-sm text-white/55">
                  Pick your days, region and interests on the left, then hit Build. We assemble a day-by-day route from real spots.
                </p>
              </div>
            )}

            {plan && plan.days.length === 0 && (
              <div className="rounded-[1.4rem] border border-white/[0.07] bg-night-800 p-10 text-center text-white/60">
                No spots matched that region yet. Try "Anywhere in the north" or different interests.
              </div>
            )}

            {plan && plan.days.length > 0 && (
              <>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Your {plan.days.length}-day itinerary</h2>
                    <p className="mt-1 text-sm text-white/55">{plan.cities.join(", ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={generate} className="rounded-full bg-night-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-night-600">
                      Shuffle
                    </button>
                    <button onClick={addToTrip} className="rounded-full bg-lime-400 px-4 py-2 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5 hover:bg-lime-300">
                      Add to Trip Builder
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {plan.days.map((d) => (
                    <Tile key={d.day} pad="p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lime-400/15 text-xs font-extrabold text-lime-400">
                          {d.day}
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Day {d.day}</p>
                          <h3 className="text-base font-extrabold text-white">{d.city}</h3>
                        </div>
                      </div>

                      {d.spots.length ? (
                        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {d.spots.map((s) => (
                            <Link
                              key={s._id}
                              to={`/city/${encodeURIComponent(s.city)}/spot/${s._id}`}
                              className="group flex gap-3 overflow-hidden rounded-xl border border-white/[0.06] bg-night-900/60 p-2 transition-colors hover:border-lime-400/30"
                            >
                              <img
                                src={s.picture} alt={s.name} loading="lazy"
                                className="h-14 w-14 shrink-0 rounded-lg object-cover"
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
                        <p className="mt-3 text-sm text-white/45">Free day. Explore {d.city} at your own pace, rest, or add extra stops.</p>
                      )}
                    </Tile>
                  ))}
                </div>

                <p className="mt-6 text-center text-xs text-white/35">
                  Built from real spots. Edit freely in the Trip Builder, then book stays and guides.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripPlanner;
