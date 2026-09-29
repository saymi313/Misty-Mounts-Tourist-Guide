export const SITE_NAME = 'Misty Mounts';
export const DEFAULT_DESCRIPTION = 'Explore Pakistani tourism with destinations, local guides, stays and tours. Plan your journey and request supplier-confirmed quotes with Misty Mounts.';
export const PUBLIC_PAGES = {
  '/travel-help': { title: 'Pakistan Trip Planning & Booking Help', description: 'Understand Pakistan trip planning, supplier quotes, payment verification, cancellations, weather information and Urdu support on Misty Mounts.' },
  '/site-map': { title: 'Public Site Directory', description: 'Browse published Misty Mounts destination, guide, stay and tour pages.' },
  '/': { title: 'Pakistan Tourism, Tours & Local Travel Planning', description: DEFAULT_DESCRIPTION },
  '/destinations': { title: 'Places to Visit in Northern Pakistan', description: 'Explore destinations in Northern Pakistan, discover local attractions, and find places to include in your next trip.' },
  '/tours': { title: 'Pakistan Tour Packages & Group Departures', description: 'Browse Pakistan tour packages, itineraries and group departures. Review supplier prices, inclusions and availability before booking.' },
  '/guides': { title: 'Local Tour Guides in Pakistan', description: 'Find local guides for your Pakistan trip. Explore guide profiles, service areas, languages and traveler reviews before making plans.' },
  '/about': { title: 'About Us — Promoting Pakistani Tourism', description: 'Meet Misty Mounts and our mission to promote Pakistani tourism, connect travelers with local communities, and encourage responsible exploration.' },
  '/contact': { title: 'Contact Misty Mounts', description: 'Contact the Misty Mounts team with questions about travel planning, supplier listings, bookings or support for your Pakistan trip.' },
  '/safety': { title: 'Pakistan Travel Safety & Trip Preparation', description: 'Prepare for travel in Pakistan with trip safety resources and reported local alerts. Check current conditions and official advice before departure.' },
  '/plan': { title: 'Pakistan Trip Planner — Build Your Itinerary', description: 'Plan a Pakistan itinerary around your dates, interests and budget. Explore destinations and request a supplier quote before confirming services.' },
};
export const PRIVATE_PREFIXES = ['/admin', '/hotel', '/local-guide', '/travel-agency', '/auth', '/panel-selector', '/payment', '/profile', '/saved', '/bookings', '/notifications', '/messages', '/trip', '/trip-requests', '/wishlist', '/feedback', '/discover', '/map'];
export function normalizePath(value = '/') {
  const path = value.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return path === '/user' ? '/' : path;
}
export function isPrivatePath(value) {
  const path = normalizePath(value);
  return PRIVATE_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}
export function isDetailPath(value) {
  return /^\/(destinations\/[^/]+|city\/[^/]+\/spot\/[^/]+|accommodations\/[^/]+|guides\/[^/]+|tours\/[^/]+)$/.test(normalizePath(value));
}
export function siteOrigin(value = 'https://www.mistymounts.pk') {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('VITE_SITE_URL must be an absolute site origin, without a path, query or credentials.');
  return url.origin;
}
export function canonicalUrl(path, origin) {
  const clean = normalizePath(path);
  if (!clean.startsWith('/') || clean.startsWith('//') || clean.includes('\\')) throw new Error('Invalid canonical path');
  return new URL(clean, siteOrigin(origin)).href;
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const safeJsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export function pageMetadata(path, override = {}, origin = 'https://www.mistymounts.pk', indexable = true) {
  const base = PUBLIC_PAGES[normalizePath(path)];
  const title = override.title || base?.title || (isPrivatePath(path) ? 'Your Account & Travel Tools' : 'Explore Pakistan');
  const description = override.description || base?.description || DEFAULT_DESCRIPTION;
  const noindex = !indexable || isPrivatePath(path) || override.noindex === true || (!base && !isDetailPath(path));
  let image;
  try { const candidate = new URL(override.image || '/Logo.png', origin); if (['https:', 'http:'].includes(candidate.protocol)) image = candidate.href; } catch { /* Use the site logo if an image URL is invalid. */ }
  return { title: `${title} | ${SITE_NAME}`, description, canonical: canonicalUrl(path, origin), image: image || `${origin}/Logo.png`, type: override.type === 'profile' ? 'profile' : 'website', robots: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', noindex };
}
export function structuredData(path, meta, detail) {
  if (meta.noindex) return null;
  const origin = new URL(meta.canonical).origin;
  const org = `${origin}/#organization`, site = `${origin}/#website`;
  const graph = [{ '@type': 'WebPage', '@id': `${meta.canonical}#webpage`, url: meta.canonical, name: meta.title, description: meta.description, inLanguage: 'en', isPartOf: { '@id': site }, publisher: { '@id': org } }];
  if (normalizePath(path) === '/') graph.push(
    { '@type': 'Organization', '@id': org, name: SITE_NAME, url: `${origin}/`, logo: `${origin}/Logo.png`, description: DEFAULT_DESCRIPTION },
    { '@type': 'WebSite', '@id': site, name: SITE_NAME, url: `${origin}/`, publisher: { '@id': org }, inLanguage: 'en' },
  );
  if (normalizePath(path) !== '/') graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${origin}/` },
    { '@type': 'ListItem', position: 2, name: meta.title.replace(` | ${SITE_NAME}`, ''), item: meta.canonical },
  ] });
  if (detail && typeof detail === 'object') {
    const { '@context': ignored, ...entity } = detail; void ignored;
    graph.push({ ...entity, '@id': `${meta.canonical}#entity`, url: meta.canonical, mainEntityOfPage: { '@id': `${meta.canonical}#webpage` } });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
