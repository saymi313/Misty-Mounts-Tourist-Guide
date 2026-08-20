/**
 * Smart trip planner — builds a day-by-day itinerary from the real spot catalog.
 * Fully algorithmic (no external AI/API), so it works offline and free: it
 * scores every spot against the traveller's interests, groups the best matches
 * by region, and paces them across the requested number of days.
 */

export const INTERESTS = [
  { key: "hiking", label: "Hiking & trekking", words: ["hike", "trek", "trail", "walk", "climb", "camp", "base camp", "summit"] },
  { key: "lakes", label: "Lakes & rivers", words: ["lake", "river", "water", "waterfall", "spring", "stream"] },
  { key: "culture", label: "Culture & history", words: ["fort", "history", "cultur", "village", "bazaar", "heritage", "monument", "shrine", "palace", "old"] },
  { key: "photography", label: "Photography & views", words: ["view", "viewpoint", "sunset", "sunrise", "panoram", "scenic", "meadow", "glacier", "peak"] },
  { key: "relaxation", label: "Relaxation", words: ["resort", "relax", "valley", "meadow", "garden", "calm", "peace", "quiet"] },
  { key: "adventure", label: "Adventure", words: ["jeep", "raft", "zip", "paraglid", "adventure", "pass", "off-road", "4x4"] },
];

export const PACE = {
  relaxed: { perDay: 2, label: "Relaxed" },
  balanced: { perDay: 3, label: "Balanced" },
  packed: { perDay: 4, label: "Packed" },
};

const haystack = (s) =>
  `${s.name || ""} ${s.description || ""} ${s.location || ""} ${(s.activities || []).join(" ")}`.toLowerCase();

const scoreSpot = (spot, interestKeys) => {
  const hay = haystack(spot);
  let score = 0.5; // base so every spot has a chance
  for (const k of interestKeys) {
    const def = INTERESTS.find((i) => i.key === k);
    if (!def) continue;
    for (const w of def.words) if (hay.includes(w)) score += 1;
  }
  if (spot.hiddenGem) score += 1.5; // surface hidden gems
  return score;
};

/** Flatten getAllSpots() ([{ city, nearbyPlaces }]) into spots with city attached. */
export const flattenSpots = (allSpots) =>
  (allSpots || []).flatMap((c) =>
    (c.nearbyPlaces || []).map((p) => ({ ...p, city: p.city || c.city }))
  );

/**
 * @param {Array} allSpots  result of getAllSpots()
 * @param {Object} opts { days, interests: string[], pace, region }
 * @returns {{ days: Array<{day:number, city:string, spots:Array}>, cities:string[] }}
 */
export function planTrip(allSpots, { days = 4, interests = [], pace = "balanced", region = "" } = {}) {
  const perDay = (PACE[pace] || PACE.balanced).perDay;
  let spots = flattenSpots(allSpots).filter((s) => s.name);

  if (region) spots = spots.filter((s) => s.city === region);
  if (!spots.length) return { days: [], cities: [] };

  // Score + sort.
  spots.forEach((s) => { s._score = scoreSpot(s, interests); });

  // Group by city, keep each city's spots sorted best-first.
  const byCity = {};
  for (const s of spots) (byCity[s.city] = byCity[s.city] || []).push(s);
  Object.values(byCity).forEach((arr) => arr.sort((a, b) => b._score - a._score));

  // Rank cities by their total top-spot score, and how many spots they offer.
  const rankedCities = Object.keys(byCity).sort((a, b) => {
    const sum = (arr) => arr.slice(0, 6).reduce((t, s) => t + s._score, 0);
    return sum(byCity[b]) - sum(byCity[a]);
  });

  // Spend ~2 days per city; cover more cities on longer trips.
  const cityCount = Math.max(1, Math.min(rankedCities.length, Math.ceil(days / 2)));
  const chosen = rankedCities.slice(0, cityCount);

  // Distribute days across chosen cities as evenly as possible.
  const daysPerCity = chosen.map((_, i) => Math.floor(days / cityCount) + (i < days % cityCount ? 1 : 0));

  const plan = [];
  let dayNo = 1;
  chosen.forEach((city, ci) => {
    const pool = [...byCity[city]];
    for (let d = 0; d < daysPerCity[ci]; d++) {
      const picks = pool.splice(0, perDay);
      // If a city runs out of spots, still emit the day (rest / explore locally).
      plan.push({ day: dayNo++, city, spots: picks });
    }
  });

  return { days: plan, cities: chosen };
}

/** Convert a plan into Trip Builder items (shape: tripStore item + day). */
export function planToTripItems(plan) {
  const items = [];
  for (const d of plan.days) {
    for (const s of d.spots) {
      items.push({
        type: "spot",
        id: s._id,
        title: s.name,
        image: s.picture,
        city: s.city,
        href: `/city/${encodeURIComponent(s.city)}/spot/${s._id}`,
        day: d.day,
      });
    }
  }
  return items;
}
