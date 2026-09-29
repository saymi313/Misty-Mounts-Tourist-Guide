import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { chromium } from 'playwright';
import { loadEnv } from 'vite';
import { JSDOM } from 'jsdom';
import { PUBLIC_PAGES, PRIVATE_PREFIXES, siteOrigin, escapeHtml, isDetailPath } from '../src/data/seoPages.js';
import { renderHead, robotsTxt, sitemapXml, llmsTxt, hostingRules } from './seo-output.mjs';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const origin = siteOrigin(env.VITE_SITE_URL || 'https://www.mistymounts.pk');
const indexable = env.VITE_SEO_INDEXABLE === 'true';
if (indexable && (!env.VITE_SITE_URL || !env.VITE_API_URL || !origin.startsWith('https://'))) throw new Error('Indexable builds require an explicit HTTPS VITE_SITE_URL and a live VITE_API_URL.');
const dist = resolve('dist');
const template = await readFile(resolve(dist, 'index.html'), 'utf8');
const paths = Object.keys(PUBLIC_PAGES).filter(path => path !== '/site-map');
if (indexable) {
  const api = env.VITE_API_URL.replace(/\/$/, '');
  const response = await fetch(`${api}/seo/catalog`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Public catalogue is unavailable (${response.status}). Refusing to publish an incomplete sitemap.`);
  const data = await response.json();
  if (!Array.isArray(data.paths) || data.paths.length > 10000 || data.paths.some(path => typeof path !== 'string' || !isDetailPath(path) || /[\\?#]|%2f|%5c|(?:^|\/)\.{1,2}(?:\/|$)/i.test(path))) throw new Error('Invalid public catalogue paths.');
  paths.push(...data.paths);
}
for (const path of paths) {
  const decoded = decodeURIComponent(path);
  if (decoded.split('/').some(segment => segment === '.' || segment === '..') || /[\\?#]/.test(decoded)) throw new Error('Unsafe public catalogue path.');
}

const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(dist, `.${path}`);
    if (file !== dist && !file.startsWith(`${dist}${sep}`)) { response.writeHead(403).end(); return; }
    let content;
    if (extname(file) && (await stat(file).catch(() => null))?.isFile()) content = await readFile(file);
    else content = template;
    response.setHeader('Content-Type', mime[extname(file)] || 'text/html');
    response.end(content);
  } catch { response.writeHead(500).end('Render server error'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const local = `http://127.0.0.1:${server.address().port}`;
let browser;
const output = [];
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block', viewport: { width: 1440, height: 1000 } });
  // Do not download media while serializing HTML. URLs remain in the output.
  await context.route('**/*', async route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method()) || ['image', 'font', 'media'].includes(request.resourceType())) return route.abort();
    // The render server uses an ephemeral localhost port. Fetch the configured
    // public API through Playwright, adapting CORS only inside this build browser.
    // No production CORS policy, credentials or response body is changed.
    if (env.VITE_API_URL && request.url().startsWith(`${env.VITE_API_URL.replace(/\/$/, '')}/`)) {
      try {
        const response = await route.fetch({ timeout: 15000 });
        return route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': local } });
      } catch { return route.abort(); }
    }
    return route.continue();
  });
  const page = await context.newPage();
  for (const path of [...new Set(paths), '/__seo_missing_page__']) {
    const failures = [], active = new Set();
    const started = request => { if (['xhr', 'fetch'].includes(request.resourceType())) active.add(request); };
    const finished = request => active.delete(request);
    const failed = request => {
      active.delete(request);
      if (request.method() === 'GET' && /\/(admin\/(cities|spots|accommodations)|user\/guides|tours)(\/|\?|$)/.test(request.url())) failures.push('network');
    };
    const received = response => {
      const url = response.url();
      if (response.status() >= 400 && /\/(admin\/(cities|spots|accommodations)|user\/guides|tours)(\/|\?|$)/.test(url)) failures.push(response.status());
    };
    page.on('request', started); page.on('requestfinished', finished); page.on('requestfailed', failed); page.on('response', received);
    try {
      await page.goto(`${local}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(() => document.documentElement.dataset.seoReady === 'true' && document.querySelector('h1'), null, { timeout: 30000 });
      // Wait for initial catalogue requests, but do not wait indefinitely on
      // optional weather integrations or analytics connections.
      const until = Date.now() + 15000;
      while (active.size && Date.now() < until) await new Promise(resolve => setTimeout(resolve, 100));
      if (indexable && [...active].some(request => /\/(admin\/(cities|spots|accommodations)|user\/guides|tours)(\/|\?|$)/.test(request.url()))) throw new Error(`Catalogue request timed out while rendering ${path}.`);
      if (indexable && failures.length) throw new Error(`Catalogue request failed while rendering ${path}.`);
      const height = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < height; y += 850) { await page.evaluate(y => window.scrollTo(0, y), y); await new Promise(resolve => setTimeout(resolve, 100)); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      const snapshot = new JSDOM(await page.content());
      const doc = snapshot.window.document;
      if (isDetailPath(path) && doc.querySelector('meta[name="robots"]')?.content.includes('noindex')) throw new Error(`Catalogue page ${path} is unavailable or non-indexable. Reconcile it before publishing.`);
      if (doc.querySelectorAll('link[rel="canonical"]').length !== 1) throw new Error(`Duplicate canonical on ${path}`);
      // Keep JSON-LD and the Vite module scripts; no browser session state is serialized.
      doc.documentElement.removeAttribute('data-seo-ready');
      const bodyText = doc.querySelector('#root')?.textContent.trim();
      if (!bodyText || bodyText.length < 50) throw new Error(`No crawlable content rendered for ${path}.`);
      const file = path === '/' ? 'index.html' : path === '/__seo_missing_page__' ? '404.html' : `${path.slice(1)}/index.html`;
      output.push({ file, html: snapshot.serialize() });
      snapshot.window.close();
      console.log(`Rendered ${path}`);
    } finally { page.off('request', started); page.off('requestfinished', finished); page.off('requestfailed', failed); page.off('response', received); }
  }
  await context.close();
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }

// Write only once every route succeeds, so failed builds cannot publish a half sitemap.
for (const item of output) {
  const file = resolve(dist, decodeURIComponent(item.file));
  if (!file.startsWith(`${dist}${sep}`)) throw new Error('Invalid snapshot output path');
  await mkdir(dirname(file), { recursive: true }); await writeFile(file, item.html);
}
const shell = new JSDOM(template);
shell.window.document.querySelector('#root')?.replaceChildren();
shell.window.document.querySelector('meta[name="robots"]').content = 'noindex, follow';
shell.window.document.getElementById('mm-jsonld')?.remove();
shell.window.document.querySelector('link[rel="canonical"]')?.remove();
shell.window.document.querySelector('meta[property="og:url"]')?.remove();
await writeFile(resolve(dist, 'app-shell.html'), shell.serialize()); shell.window.close();
const published = [...new Set(paths)];
await writeFile(resolve(dist, 'robots.txt'), robotsTxt(origin, indexable, env.SEO_ALLOW_TRAINING === 'true'));
await writeFile(resolve(dist, 'sitemap.xml'), sitemapXml(indexable ? [...published, '/site-map'] : [], origin));
await writeFile(resolve(dist, 'llms.txt'), llmsTxt(origin));
await mkdir(resolve(dist, 'site-map'), { recursive: true });
await writeFile(resolve(dist, 'site-map/index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${renderHead('/site-map', origin, indexable, { title: 'Public Site Directory', description: 'Browse all published Misty Mounts destination, guide, stay and tour pages.' })}</head><body><header><a href="/">Misty Mounts</a></header><main><h1>Public site directory</h1><ul>${published.map(path => `<li><a href="${escapeHtml(path)}">${escapeHtml(PUBLIC_PAGES[path]?.title || decodeURIComponent(path).split('/').filter(Boolean).join(' / '))}</a></li>`).join('')}</ul></main></body></html>`);
await writeFile(resolve(dist, 'hosting-vercel.json'), JSON.stringify(hostingRules([...published, '/site-map'], indexable), null, 2));
const redirects = ['/user / 301', ...PRIVATE_PREFIXES.flatMap(path => [`${path} /app-shell.html 200`, `${path}/* /app-shell.html 200`]), ...published.filter(path => path !== '/').map(path => `${path} ${path}/index.html 200`), '/* /404.html 404'];
await writeFile(resolve(dist, '_redirects'), redirects.join('\n') + '\n');
const headers = [...(!indexable ? ['/*\n  X-Robots-Tag: noindex, nofollow'] : []), ...PRIVATE_PREFIXES.flatMap(path => [`${path}\n  X-Robots-Tag: noindex, follow`, `${path}/*\n  X-Robots-Tag: noindex, follow`]), '/app-shell.html\n  X-Robots-Tag: noindex, follow', '/404.html\n  X-Robots-Tag: noindex, follow', '/assets/*\n  Cache-Control: public, max-age=31536000, immutable'];
await writeFile(resolve(dist, '_headers'), headers.join('\n\n') + '\n');
console.log(`SEO output: ${published.length} public snapshots. Search indexing ${indexable ? 'enabled' : 'disabled for preview/demo'}.`);
