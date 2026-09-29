import { PUBLIC_PAGES, PRIVATE_PREFIXES, pageMetadata, structuredData, safeJsonLd, escapeHtml, canonicalUrl } from '../src/data/seoPages.js';

export function renderHead(path, origin, indexable, override = {}) {
  const page = pageMetadata(path, override, origin, indexable);
  const tags = [['name', 'description', page.description], ['name', 'robots', page.robots], ['property', 'og:title', page.title], ['property', 'og:description', page.description], ['property', 'og:url', page.canonical], ['property', 'og:type', page.type], ['property', 'og:site_name', 'Misty Mounts'], ['property', 'og:locale', 'en_PK'], ['property', 'og:image', page.image], ['property', 'og:image:alt', 'Misty Mounts — Pakistan travel'], ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', page.title], ['name', 'twitter:description', page.description], ['name', 'twitter:image', page.image], ['name', 'twitter:image:alt', 'Misty Mounts — Pakistan travel']];
  const data = structuredData(path, page, override.jsonLd);
  return `<title>${escapeHtml(page.title)}</title>\n<link rel="canonical" href="${escapeHtml(page.canonical)}">\n${tags.map(([attribute, name, content]) => `<meta ${attribute}="${name}" content="${escapeHtml(content)}">`).join('\n')}\n${data ? `<script type="application/ld+json" id="mm-jsonld">${safeJsonLd(data)}</script>` : ''}`;
}
export function robotsTxt(origin, indexable, allowTraining = false) {
  if (!indexable) return '# Preview/demo deployment: do not index.\nUser-agent: *\nDisallow: /\n';
  return `# Public pages may be crawled; account pages carry noindex and require authentication.\n# Search discovery is separate from model training.\nUser-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\n${allowTraining ? 'Allow' : 'Disallow'}: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}
export function sitemapXml(paths, origin) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)].map(path => `  <url><loc>${escapeHtml(canonicalUrl(path, origin))}</loc></url>`).join('\n')}\n</urlset>\n`;
}
export function llmsTxt(origin) {
  return `# Misty Mounts\n\n> A Pakistani tourism website for discovering destinations, local guides, stays and tours, with itinerary planning and supplier quote requests.\n\n## Public pages\n\n${Object.entries(PUBLIC_PAGES).map(([path, page]) => `- [${page.title}](${origin}${path}): ${page.description}`).join('\n')}\n- [All published pages](${origin}/site-map): Links to the public catalogue.\n\n## Booking and information scope\n\nPrices, dates, inclusions and availability must be checked on the relevant listing and confirmed with the supplier. AI itineraries are proposals, not confirmed reservations. Weather forecasts and local reports do not establish route safety. Identity-document review is distinct from service-quality certification. Config-dependent AI features may be under construction. Account details, private messages, payment records and dashboards are not public resources.\n\nThis file is a supplementary navigation guide, not permission to access private data or a guarantee of inclusion in AI answers.\n`;
}
export function hostingRules(paths, indexable) {
  const rules = PRIVATE_PREFIXES.flatMap(path => [{ src: `${path}(?:/.*)?`, dest: '/app-shell.html', headers: { 'X-Robots-Tag': 'noindex, follow' } }]);
  return {
    routes: [
      { src: '/user/?', status: 308, headers: { Location: '/' } },
      ...(!indexable ? [{ src: '/(.*)', headers: { 'X-Robots-Tag': 'noindex, nofollow' }, continue: true }] : []),
      { src: '/assets/(.*)', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
      { src: '/(robots\\.txt|sitemap\\.xml|llms\\.txt|sw\\.js)', headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' }, continue: true },
      ...rules,
      ...paths.filter(path => path !== '/').map(path => ({ src: `${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?`, dest: `${path}/index.html` })),
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/404.html', status: 404, headers: { 'X-Robots-Tag': 'noindex, follow' } },
    ],
  };
}
