// Planning heuristics, not warnings issued by a meteorological authority.
export function assessDay(daily, date) {
  const index = daily?.time?.indexOf(date) ?? -1;
  if (index < 0) return { status: 'unavailable', reason: 'No forecast for this date. Check again closer to departure.' };
  const value = key => Number.isFinite(daily[key]?.[index]) ? daily[key][index] : null;
  const code = value('weather_code'), rain = value('precipitation_probability_max');
  const wind = value('wind_speed_10m_max');
  const min = value('temperature_2m_min'), max = value('temperature_2m_max');
  if ([code, rain, wind, min, max].some(v => v === null)) return { status: 'unavailable', reason: 'Forecast data is incomplete for this date.' };
  if (![0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99].includes(code) || rain < 0 || rain > 100 || wind < 0 || min > max) return { status: 'unavailable', reason: 'Forecast data could not be validated.' };
  const severe = [65, 67, 75, 82, 86, 95, 96, 99].includes(code) || wind >= 50;
  const caution = severe || code >= 51 || [45, 48].includes(code) || rain >= 60 || wind >= 30 || min <= 0;
  return { status: 'available', code, rain, wind, min, max, level: severe ? 2 : caution ? 1 : 0,
    reason: severe ? 'Consider postponing exposed outdoor activities; check local conditions with your guide.' : caution ? 'Allow flexibility for rain, cold, fog or wind. Check conditions before outdoor activities.' : 'No planning threshold triggered. This does not confirm road access or safe conditions.' };
}
export const outdoorCount = day => (day.spots || []).filter(spot => /hik|trek|climb|boat|raft|camp|glacier|lake|pass|waterfall/i.test(`${spot.name} ${(spot.activities || []).join(' ')} ${spot.description || ''}`)).length;
export function suggestSwaps(days, weather) {
  const used = new Set(), swaps = [];
  for (const day of days) {
    const current = weather[day.day];
    if (used.has(day.day) || current?.status !== 'available' || current.level < 1 || !outdoorCount(day)) continue;
    const alternative = days.find(other => !used.has(other.day) && other.day !== day.day && other.city === day.city && weather[other.day]?.status === 'available' && weather[other.day].level < current.level && outdoorCount(other) < outdoorCount(day));
    if (alternative) {
      used.add(day.day); used.add(alternative.day);
      swaps.push({ from: day.day, to: alternative.day, reason: `Day ${alternative.day} has fewer weather concerns and fewer exposed outdoor stops. Review a swap with day ${day.day}; confirm opening times and bookings first.` });
    }
  }
  return swaps;
}
export function swapActivities(plan, from, to) {
  const first = plan.days.find(d => d.day === from), second = plan.days.find(d => d.day === to);
  if (!first || !second || first.city !== second.city) return plan;
  return { ...plan, days: plan.days.map(d => d.day === from ? { ...d, spots: second.spots } : d.day === to ? { ...d, spots: first.spots } : d) };
}
export function reportsForCity(reports, city) {
  if (!city?.trim()) return [];
  const target = city.toLowerCase();
  return reports.filter(report => !report.isResolved && [report.location, ...(Array.isArray(report.affectedAreas) ? report.affectedAreas : [])].some(area => typeof area === 'string' && area.toLowerCase().includes(target)));
}
