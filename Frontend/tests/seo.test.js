import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { canonicalUrl, isPrivatePath, pageMetadata, safeJsonLd, structuredData, siteOrigin } from '../src/data/seoPages.js';
import { renderHead, robotsTxt, sitemapXml, hostingRules } from '../scripts/seo-output.mjs';
const origin = 'https://tourism.example';
test('canonicals use the configured origin and remove tracking queries, hashes and homepage aliases', () => {
  assert.equal(canonicalUrl('/user?utm_source=demo#section', origin), `${origin}/`);
  assert.equal(canonicalUrl('/destinations/Hunza/?q=1', origin), `${origin}/destinations/Hunza`);
  assert.throws(() => canonicalUrl('//attacker.example', origin));
  assert.throws(() => siteOrigin('https://example.com/private'));
  assert.throws(() => siteOrigin('javascript:alert(1)'));
});
test('private routes are noindex without accidentally excluding hotel listings', () => {
  for (const path of ['/admin/users', '/hotel/quotes', '/trip-requests', '/auth', '/messages', '/payment', '/discover']) assert.equal(pageMetadata(path, {}, origin).noindex, true);
  assert.equal(isPrivatePath('/accommodations/hunza-hotel'), false);
  assert.equal(pageMetadata('/accommodations/hunza-hotel', {}, origin).noindex, false);
  assert.equal(pageMetadata('/missing-page', {}, origin).noindex, true);
  assert.equal(pageMetadata('/about', {}, origin, false).noindex, true);
});
test('HTML and JSON-LD escape untrusted strings and emit exactly one canonical', () => {
  const title = '</title><script>alert(1)</script>';
  const doc = new JSDOM(`<head>${renderHead('/about', origin, true, { title })}</head>`).window.document;
  assert.equal(doc.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(doc.querySelectorAll('script:not([type="application/ld+json"])').length, 0);
  assert.match(doc.title, /alert/);
  assert.equal(safeJsonLd({ text: '</script>' }).includes('</script>'), false);
  assert.equal(doc.querySelector('meta[property="og:image"]').content, `${origin}/Logo.png`);
});
test('structured data omits private information and resets page images to the default', () => {
  assert.equal(structuredData('/bookings', pageMetadata('/bookings', {}, origin)), null);
  assert.equal(pageMetadata('/about', {}, origin).image, `${origin}/Logo.png`);
  const graph = structuredData('/', pageMetadata('/', {}, origin))['@graph'];
  assert.ok(graph.some(node => node['@type'] === 'Organization'));
  assert.ok(!JSON.stringify(graph).includes('AggregateRating'));
});
test('crawler rules distinguish search from training and sitemap XML is deduplicated and escaped', () => {
  const robots = robotsTxt(origin, true);
  assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \//);
  assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
  assert.match(robotsTxt(origin, false), /User-agent: \*\nDisallow: \//);
  assert.equal((sitemapXml(['/about', '/about'], origin).match(/<url>/g) || []).length, 1);
  const rules = hostingRules(['/about'], true).routes;
  assert.equal(rules.at(-1).status, 404);
  assert.ok(rules.some(rule => rule.src === '/user/?' && rule.status === 308));
});
