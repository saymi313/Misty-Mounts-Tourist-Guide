import { INTERESTS } from './tripPlanner.js';

export function recommendSpots(spots, { interests = [], savedIds = [], savedItems = [], limit = 6 } = {}) {
  const saved = new Set([...savedIds.map(String), ...savedItems.filter(item => item.type === 'spot').map(item => String(item.id))]);
  const cities = new Set([...savedItems.map(item => item.city), ...spots.filter(spot => saved.has(String(spot._id))).map(spot => spot.city)].filter(Boolean));
  const interestGroups = interests.filter(value => typeof value === 'string').map(value => {
    const lower = value.toLowerCase();
    const known = INTERESTS.find(group => group.key === lower || group.label.toLowerCase() === lower || group.words.some(word => lower.includes(word)));
    return { label: known?.label || value, words: known?.words || lower.split(/[^\p{L}\p{N}]+/u).filter(word => word.length > 2 && word !== 'and') };
  });
  const ranked = spots.filter(spot => spot._id && spot.name && spot.isApproved !== false && !saved.has(String(spot._id))).map(spot => {
    const text = `${spot.name} ${spot.description || ''} ${(spot.activities || []).join(' ')}`.toLowerCase();
    const matches = [...new Set(interestGroups.filter(group => group.words.some(word => text.includes(word))).map(group => group.label))];
    const reasons = matches.map(label => `Matches your ${label.toLowerCase()} interest`);
    if (cities.has(spot.city)) reasons.push(`More to explore in ${spot.city}, a city in your saved items`);
    return { spot, score: matches.length * 3 + (cities.has(spot.city) ? 2 : 0), reasons };
  }).sort((a, b) => b.score - a.score || a.spot.name.localeCompare(b.spot.name));
  const hasMatches = ranked.some(item => item.score > 0);
  const counts = new Map(), seen = new Set(), results = [];
  for (const item of ranked) {
    if ((hasMatches && !item.score) || (counts.get(item.spot.city) || 0) >= 2 || seen.has(String(item.spot._id))) continue;
    counts.set(item.spot.city, (counts.get(item.spot.city) || 0) + 1); seen.add(String(item.spot._id));
    results.push({ ...item, reasons: item.reasons.length ? item.reasons.slice(0, 2) : ['Explore this catalogue destination'] });
    if (results.length >= limit) break;
  }
  return { results, personalized: hasMatches };
}
