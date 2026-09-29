import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useWishlist from '../hooks/useWishlist';
import useTrip from '../hooks/useTrip';
import { getSaved, subscribeSaved } from '../utils/savedStore';
import { getAllSpots } from '../data/mockApi';
import { flattenSpots, INTERESTS } from '../utils/tripPlanner';
import { recommendSpots } from '../utils/recommendations';

export default function RecommendedSpots() {
  const { user } = useAuth();
  const wishlist = useWishlist();
  const trip = useTrip();
  const savedIds = useSyncExternalStore(subscribeSaved, getSaved, getSaved);
  const [spots, setSpots] = useState([]);
  const [state, setState] = useState('loading');
  const [selected, setSelected] = useState([]);
  const [personalize, setPersonalize] = useState(true);
  const [retry, setRetry] = useState(0);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true; setState('loading');
    getAllSpots().then(catalog => { if (active) { setSpots(flattenSpots(catalog.filter(city => city.isApproved !== false))); setState('ready'); } }).catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [retry]);
  const recommendations = useMemo(() => recommendSpots(spots, {
    interests: [...selected, ...(personalize && Array.isArray(user?.interests) ? user.interests : [])],
    savedIds: personalize && Array.isArray(savedIds) ? savedIds : [],
    savedItems: personalize ? [...(Array.isArray(wishlist.items) ? wishlist.items : []), ...(Array.isArray(trip.items) ? trip.items : [])] : [],
  }), [spots, selected, personalize, user?.interests, savedIds, wishlist.items, trip.items]);
  return <section className="mt-10 border-t border-white/15 pt-6" aria-label="Destination recommendations">
    <h2 className="text-xl font-bold">{recommendations.personalized ? 'Ideas for your next trip' : 'Explore somewhere new'}</h2>
    <p className="mt-2 text-sm text-white/70">Choose interests to find relevant destinations. Matching happens on this device and explains each suggestion.</p>
    <label className="mt-3 flex min-h-11 items-center gap-3 text-sm text-white/80"><input type="checkbox" checked={personalize} onChange={event => setPersonalize(event.target.checked)} className="h-5 w-5 accent-lime-400" />Use my profile interests and saved items on this device</label>
    <div className="mt-3 flex flex-wrap gap-2">
      {INTERESTS.map(interest => <button type="button" key={interest.key} aria-pressed={selected.includes(interest.key)} onClick={() => setSelected(current => current.includes(interest.key) ? current.filter(key => key !== interest.key) : [...current, interest.key])} className={`min-h-11 rounded-full border px-4 text-sm focus:outline-lime-400 ${selected.includes(interest.key) ? 'border-lime-400 bg-lime-400 text-night-950' : 'border-white/20 text-white/80'}`}>{interest.label}</button>)}
    </div>
    {state === 'loading' && <p role="status" className="mt-4 text-sm text-white/70">Loading destinations…</p>}
    {notice && <p role="status" className="mt-3 text-sm text-lime-300">{notice}</p>}
    {state === 'error' && <div role="alert" className="mt-4 text-sm text-amber-200">Destinations could not load. <button type="button" onClick={() => setRetry(value => value + 1)} className="min-h-11 px-3 underline">Try again</button></div>}
    {state === 'ready' && <>
      {!recommendations.personalized && <p className="mt-4 text-xs text-white/65">General catalogue suggestions — no matching preference signals yet.</p>}
      {!recommendations.results.length && <p className="mt-4 text-sm text-white/70">No new destinations to suggest. Try changing your interests or browsing the catalogue.</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.results.map(({ spot, reasons }) => <article key={spot._id} className="rounded-2xl border border-white/10 bg-night-800 p-4">
          <Link to={`/city/${encodeURIComponent(spot.city)}/spot/${encodeURIComponent(spot._id)}`} className="text-base font-bold text-lime-300 hover:underline">{spot.name}</Link>
          <p className="mt-1 text-sm text-white/70">{spot.city}</p>
          {reasons.map(reason => <p key={reason} className="mt-2 text-xs leading-relaxed text-white/70">{reason}</p>)}
          <button type="button" onClick={() => { const saved = wishlist.toggle({ type: 'spot', id: spot._id, title: spot.name, city: spot.city, image: spot.picture, href: `/city/${encodeURIComponent(spot.city)}/spot/${encodeURIComponent(spot._id)}` }); setNotice(`${spot.name} ${saved ? 'saved to' : 'removed from'} your wishlist.`); }} className="mt-3 min-h-11 rounded-xl border border-white/20 px-3 text-sm text-white/80">{wishlist.isWished('spot', spot._id) ? 'Remove from wishlist' : 'Save to wishlist'}</button>
        </article>)}
      </div>
    </>}
  </section>;
}
