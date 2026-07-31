/**
 * Approximate coordinates for northern-Pakistan destination cities, so the
 * explore map can place a pin per region without per-spot geodata. Extend as new
 * cities are added; a spot that carries its own { lat, lng } overrides this.
 */
export const CITY_COORDS = {
  Hunza: [36.3167, 74.65],
  Nagar: [36.25, 74.75],
  Gilgit: [35.9208, 74.3083],
  Ghizer: [36.2167, 73.7],
  Skardu: [35.2971, 75.6333],
  Astore: [35.3667, 74.8583],
  "Fairy Meadows": [35.3878, 74.5772],
  Naran: [34.9086, 73.6503],
  Kaghan: [34.7739, 73.5215],
  Mansehra: [34.3333, 73.2],
  Balakot: [34.5461, 73.3541],
  Abbottabad: [34.1688, 73.2215],
  Swat: [35.2227, 72.4258],
  Kalam: [35.4844, 72.5808],
  Malam: [34.8, 72.57],
  Chitral: [35.8511, 71.7889],
  Murree: [33.907, 73.3943],
  Muzaffarabad: [34.3700, 73.4711],
  Neelum: [34.5877, 73.9070],
};

export const DEFAULT_CENTER = [35.4, 74.2];
export const DEFAULT_ZOOM = 7;

/** Resolve [lat,lng] for a spot (own coords) or its city. */
export const coordsFor = (spot, city) => {
  if (spot && Number.isFinite(spot.lat) && Number.isFinite(spot.lng)) return [spot.lat, spot.lng];
  return CITY_COORDS[city] || null;
};
