function validateOptions(input = {}) {
  const days = Number(input.days), people = Number(input.people), budget = Number(input.budget);
  if (!Number.isInteger(days) || days < 1 || days > 14) throw new Error('Choose 1â€“14 days.');
  if (!Number.isInteger(people) || people < 1 || people > 20) throw new Error('Choose 1â€“20 travellers.');
  if (!Number.isFinite(budget) || budget <= 0 || budget > 10000000) throw new Error('Enter a total budget between PKR 1 and 10,000,000.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate || '') || !Number.isFinite(Date.parse(input.startDate)) || new Date(input.startDate).toISOString().slice(0, 10) !== input.startDate) throw new Error('Choose a valid departure date.');
  const text = (value, max = 100) => typeof value === 'string' ? value.trim().slice(0, max) : '';
  return { days, people, budget, startDate: input.startDate, region: text(input.region), departure: text(input.departure),
    transport: ['own-car', 'public', 'rental'].includes(input.transport) ? input.transport : 'own-car',
    pace: ['relaxed', 'balanced', 'packed'].includes(input.pace) ? input.pace : 'balanced',
    interests: Array.isArray(input.interests) ? input.interests.filter(x => typeof x === 'string').slice(0, 6).map(x => x.slice(0, 40)) : [],
    instructions: text(input.instructions, 1000) };
}
function rank(items, query, limit = 12) {
  const words = [...new Set(String(query).toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || [])];
  return items.map(item => ({ item, score: words.reduce((n, word) => n + (JSON.stringify(item).toLowerCase().includes(word) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score).slice(0, limit).map(x => x.item);
}
function buildPlan(catalog, opts, suggested) {
  const available = catalog.spots.filter(s => !opts.region || s.city.toLowerCase() === opts.region.toLowerCase());
  const ranked = rank(available, `${opts.interests.join(' ')} ${opts.instructions}`, 80);
  // Keep a single base city until road-route data is available.
  const city = ranked[0]?.city;
  const pool = ranked.filter(s => s.city === city);
  if (!pool.length) return { days: [], cities: [], fallback: true, options: opts };
  const byId = new Map(pool.map(s => [s._id, s]));
  const used = new Set();
  const perDay = { relaxed: 2, balanced: 3, packed: 4 }[opts.pace];
  let ai = Array.isArray(suggested?.days) && suggested.days.length === opts.days;
  if (ai) {
    const ids = suggested.days.flatMap(d => Array.isArray(d?.spotIds) ? d.spotIds : ['INVALID']);
    ai = ids.every(id => byId.has(id)) && new Set(ids).size === ids.length && ids.length > 0 && suggested.days.every(d => d.spotIds.length <= perDay);
  }
  const days = Array.from({ length: opts.days }, (_, i) => {
    const spots = ai ? suggested.days[i].spotIds.map(id => byId.get(id)) : pool.filter(s => !used.has(s._id)).slice(0, perDay);
    spots.forEach(s => used.add(s._id));
    const date = new Date(`${opts.startDate}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + i);
    return { day: i + 1, date: date.toISOString().slice(0, 10), city: city || opts.region, spots };
  });
  const nights = Math.max(0, opts.days - 1), rooms = Math.ceil(opts.people / 2);
  const stay = catalog.hotels.filter(h => h.city === city && Number.isFinite(h.price) && h.price >= 0 && days.slice(0, nights).every(d => !(h.blackoutDates || []).includes(d.date))).sort((a, b) => a.price - b.price)[0];
  const lodging = nights ? (stay ? stay.price * nights * rooms : null) : 0;
  const food = 1800 * opts.people * opts.days;
  const transport = ({ 'own-car': 3500, public: 1500 * opts.people, rental: 10000 })[opts.transport] * opts.days;
  const subtotal = (lodging || 0) + food + transport;
  const contingency = Math.ceil(subtotal * 0.15);
  return { days, cities: city ? [city] : [], fallback: !ai, options: opts, stay: nights ? stay || null : null,
    budget: { lodging, food, transport, contingency, total: subtotal + contingency, limit: opts.budget, incomplete: lodging === null, overBudget: subtotal + contingency > opts.budget },
    notes: ['Planning estimate, not a booking quote. Food and transport use planning assumptions: PKR 1,800/person/day for food; own car PKR 3,500/day, public transport PKR 1,500/person/day, rental PKR 10,000/day.',
      `Lodging assumes ${rooms} room(s), two travellers per room, for ${nights} night(s). Confirm capacity and availability before booking.`,
      'Road travel times, entry fees, flights, and travel to/from the departure city are not included. Confirm road access and visit durations with a local guide.'],
  };
}
module.exports = { validateOptions, rank, buildPlan };

