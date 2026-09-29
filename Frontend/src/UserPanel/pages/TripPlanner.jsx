import useFeatures from "../../hooks/useFeatures";
import FeatureNotice from "../../components/FeatureNotice";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Chip } from "../components/bento/tiles";
import { getAllSpots } from "../../data/mockApi";
import { CITY_COORDS } from "../../data/geo";
import useTrip from "../../hooks/useTrip";
import { INTERESTS, PACE, planTrip, planToTripItems } from "../../utils/tripPlanner";
import api, { LIVE } from "../../data/api";
import TripWeather from "../../components/TripWeather";
import { swapActivities } from "../../utils/tripWeather";

const REGIONS = ["", ...Object.keys(CITY_COORDS)];

const TripPlanner = () => {
  const features = useFeatures();
  const navigate = useNavigate();
  const { setAll } = useTrip();

  const [days, setDays] = useState(4);
  const [interests, setInterests] = useState(["hiking", "lakes"]);
  const [pace, setPace] = useState("balanced");
  const [region, setRegion] = useState("");
  const [plan, setPlan] = useState(null);
  const [planVersion, setPlanVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState({ startDate: new Date().toISOString().slice(0, 10), people: 2, budget: 100000, departure: "", transport: "own-car", instructions: "" });
  const field = (key, value) => setDetails(previous => ({ ...previous, [key]: value }));

  const toggleInterest = (k) =>
    setInterests((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const generate = async () => {
    setBusy(true);
    setError("");
    try {
      if (LIVE) {
        const { data } = await api.post('/ai/plan', { ...details, days: Number(days), interests, pace, region }, { timeout: 30000 });
        setPlan(data);
      } else {
        const spots = await getAllSpots();
        if (!Number.isFinite(Date.parse(details.startDate))) throw new Error('Invalid departure date');
        const basic = planTrip(spots, { days: Number(days), interests, pace, region });
        basic.days = basic.days.map(day => {
          const date = new Date(`${details.startDate}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + day.day - 1);
          return { ...day, date: date.toISOString().slice(0, 10) };
        });
        setPlan({ ...basic, fallback: true });
      }
      setPlanVersion(previous => previous + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not build your itinerary. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const requestQuote = () => {
    const dates = plan.days.map(day => day.date).filter(Boolean);
    const end = new Date(`${details.startDate}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + Number(days) - 1);
    const draft = { destination: region || plan.days[0]?.city || '', startDate: dates[0] || details.startDate, endDate: dates.at(-1) || end.toISOString().slice(0, 10), people: Number(details.people), budget: Number(details.budget), requirements: details.instructions || `Please quote a ${days}-day trip including stays, guides and transport. Departure: ${details.departure || 'to be agreed'}.`, itinerary: plan.days.map(day => `Day ${day.day}${day.date ? ` (${day.date})` : ''}: ${day.city || ''}\n${(day.spots || []).map(spot => spot.name || spot.title || '').filter(Boolean).join(', ')}`).join('\n\n').slice(0, 12000) };
    try { sessionStorage.setItem('mm-quote-draft', JSON.stringify(draft)); } catch { /* The request form also works without a saved draft. */ }
    navigate('/trip-requests');
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
          {!features.gemini && <FeatureNotice feature="AI itinerary refinement" state={features.state}>Basic trip planning and supplier quote requests are available.</FeatureNotice>}
          <Link to="/trip-requests" className="mt-3 inline-block min-h-11 text-sm text-lime-300 underline">Your supplier quotes and trip requests</Link>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight">
            Plan your perfect trip to <span className="text-lime-400">the north.</span>
          </h1>
          <p className="mt-4 text-white/60">
            Plan with real destinations, a group budget, and your interests. Review your itinerary, then save it to Trip Builder.
          </p>
        </header>

        {/* Workspace: sticky control panel + live results */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
          {/* Control panel */}
          <Tile pad="p-5" className="lg:sticky lg:top-24">
            <div className="mb-5 space-y-3">
              {[
                ['startDate', 'Departure date', 'date'], ['departure', 'Departing from', 'text'],
                ['people', 'Travellers (1–20)', 'number'], ['budget', 'Total group budget (PKR)', 'number'],
              ].map(([key, label, type]) => (
                <label key={key} className="block text-sm font-semibold text-white/80">
                  {label}
                  <input type={type} value={details[key]} onChange={e => field(key, e.target.value)} min={type === 'number' ? 1 : undefined} max={key === 'people' ? 20 : key === 'budget' ? 10000000 : undefined}
                    className="mt-1 min-h-11 w-full rounded-xl border border-white/15 bg-night-900 px-3 text-base focus:outline-lime-400" />
                </label>
              ))}
              <label className="block text-sm font-semibold text-white/80">Transport
                <select value={details.transport} onChange={e => field('transport', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-white/15 bg-night-900 px-3 text-base focus:outline-lime-400">
                  <option value="own-car">Own car</option><option value="public">Public transport</option><option value="rental">Rental vehicle</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-white/80">Preferences or changes
                <textarea value={details.instructions} maxLength={1000} onChange={e => field('instructions', e.target.value)} placeholder="Make day three more relaxed, include lakes…" className="mt-1 min-h-24 w-full rounded-xl border border-white/15 bg-night-900 p-3 text-base focus:outline-lime-400" />
              </label>
              <p className="text-xs text-white/60">{features.gemini ? 'AI uses your preferences; dates, group size and budget come from these fields.' : 'Basic planning uses catalogue destinations. Dates, group size and budget come from these fields.'}</p>
            </div>
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
            {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/40 p-4 text-red-200">{error}</p>}
            {busy && <p role="status" className="mb-4 text-lime-300">Building your itinerary. This may take up to 30 seconds.</p>}
            {plan && <p role="status" className="mb-4 text-sm text-white/70">{plan.fallback ? 'Basic itinerary — AI refinement is unavailable or could not be validated.' : 'AI-assisted itinerary — destinations validated against the catalogue.'}</p>}
            {plan?.days.length > 0 && <TripWeather key={planVersion} plan={plan} onSwap={(from, to) => setPlan(previous => swapActivities(previous, from, to))} />}
            {plan?.budget && <Tile pad="p-5" className="mb-5">
              <h2 className="text-lg font-bold">Estimated group cost: PKR {plan.budget.total.toLocaleString()}</h2>
              <p className="mt-2 text-sm text-white/75">Lodging: {plan.budget.lodging === null ? 'price unavailable' : `PKR ${plan.budget.lodging.toLocaleString()}`} · Food: PKR {plan.budget.food.toLocaleString()} · Transport: PKR {plan.budget.transport.toLocaleString()} · Contingency: PKR {plan.budget.contingency.toLocaleString()}</p>
              <p className="mt-2 text-sm text-lime-300">{plan.budget.overBudget ? `Over your budget by PKR ${(plan.budget.total - plan.budget.limit).toLocaleString()}. Try fewer days or another region.` : 'Estimated included costs fit your budget.'} {plan.budget.incomplete && 'Total is incomplete: lodging is not included.'}</p>
              {plan.stay && <Link className="mt-3 block text-lime-300 underline" to={`/accommodations/${encodeURIComponent(plan.stay._id)}`}>Suggested stay: {plan.stay.name} — check availability</Link>}
              {plan.notes.map(note => <p key={note} className="mt-3 text-xs leading-relaxed text-white/65">{note}</p>)}
            </Tile>}
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
                No spots matched that region yet. Try &quot;Anywhere in the north&quot; or different interests.
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
                    <button onClick={generate} disabled={busy} className="rounded-full bg-night-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-night-600 disabled:opacity-50">
                      Apply preferences
                    </button>
                    <button onClick={requestQuote} className="min-h-11 rounded-full border border-lime-400 px-4 py-2 text-sm font-bold text-lime-300">Request supplier quote</button>
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
                          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Day {d.day}{d.date ? ` · ${d.date}` : ''}</p>
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
