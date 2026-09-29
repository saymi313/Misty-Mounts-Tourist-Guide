const STOP = new Set('a an the and or for with near in to of me find show want would like places place spots spot no not without avoid'.split(' '));
const tokens = text => [...new Set((String(text).toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || []).filter(word => !STOP.has(word)).map(word => /^[a-z]{4,}s$/.test(word) && !word.endsWith('ss') ? word.slice(0, -1) : word))];
function searchSpots(spots, query, region = '', interpretation = null) {
  const cities = [...new Set(spots.map(s => s.city))];
  const inferred = cities.filter(city => tokens(city).every(word => tokens(query).includes(word)));
  const regions = region ? [region] : inferred;
  // Negated words must never become positive ranking signals.
  const negated = [...query.toLowerCase().matchAll(/\b(?:no|not|without|avoid)\s+([\p{L}\p{N}]+)/gu)].flatMap(match => tokens(match[1]));
  const terms = tokens(query).filter(term => !negated.includes(term));
  const expansions = Array.isArray(interpretation?.terms) ? interpretation.terms.filter(t => typeof t === 'string' && t.length <= 40).slice(0, 12).flatMap(tokens) : [];
  const expanded = [...new Set(expansions)].filter(t => !terms.includes(t) && !negated.includes(t));
  const results = spots.filter(s => !regions.length || regions.some(r => r.toLowerCase() === s.city.toLowerCase())).map(spot => {
    const text = `${spot.name} ${spot.description || ''} ${(spot.activities || []).join(' ')}`.toLowerCase();
    const matched = [...terms, ...expanded].filter(term => text.includes(term));
    const score = terms.reduce((n, t) => n + (text.includes(t) ? 2 : 0), 0) + expanded.reduce((n, t) => n + (text.includes(t) ? 1 : 0), 0);
    return { id: spot._id, spot, score, matched: matched.slice(0, 5) };
  }).filter(result => result.score > 0 || (regions.length && terms.every(term => tokens(regions.join(' ')).includes(term))))
    .sort((a, b) => b.score - a.score || a.spot.name.localeCompare(b.spot.name)).slice(0, 12);
  return { results, regions, expandedTerms: expanded, fallback: !expanded.length,
    limitations: 'Results use catalogue descriptions. Prices, accessibility, crowd levels, exclusions and road distances are not verified search filters. A city match means listed in that city, not a measured distance from it.' };
}
module.exports = { searchSpots };
