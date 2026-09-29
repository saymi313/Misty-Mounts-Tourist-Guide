import api, { LIVE } from '../data/api';
import { translations } from '../data/translations';
import { urduPhrases } from '../data/urduPhrases';
import { createTranslationCollector, translationBatches } from './translationDom';

// Version change deliberately invalidates the old fragment-by-fragment cache.
const CACHE_KEY = 'mm-tr-cache-ur-sentences-v2';
const reviewed = { ...Object.fromEntries(Object.entries(translations.en).map(([key, text]) => [text, translations.ur[key]]).filter(([, text]) => text)), ...urduPhrases };
let cache;
try {
  const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  cache = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
} catch { cache = {}; }
Object.assign(cache, reviewed);
const collect = createTranslationCollector();
const retryAfter = new Map();
let enabled = false, observer, timer, safetyTimer, running = false, session = 0, controller;

function apply(jobs) {
  const missing = new Set();
  for (const job of jobs) {
    if (Object.hasOwn(cache, job.key) && typeof cache[job.key] === 'string') job.apply(cache[job.key]);
    else if ((retryAfter.get(job.key) || 0) <= Date.now()) missing.add(job.key);
  }
  return [...missing];
}
function persist() {
  // Bound browser storage; curated phrases always take precedence.
  cache = { ...Object.fromEntries(Object.entries(cache).slice(-2000)), ...reviewed };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* Translation still works if storage is full. */ }
}
async function translatePage() {
  if (!enabled || running) return;
  running = true;
  const currentSession = session;
  controller = new AbortController();
  try {
    const missing = apply(collect(document.body));
    if (!LIVE) return;
    for (const chunk of translationBatches(missing)) {
      if (!enabled || session !== currentSession) return;
      try {
        const { data } = await api.post('/translate', { q: chunk, target: 'ur', source: 'en' }, { timeout: 45000, signal: controller.signal });
        if (!enabled || session !== currentSession) return;
        chunk.forEach((source, i) => {
          const text = data?.translations?.[i];
          if (data?.translated?.[i] && typeof text === 'string' && /[\u0600-\u06ff]/.test(text) && text !== source) {
            cache[source] = text; retryAfter.delete(source);
          } else retryAfter.set(source, Date.now() + 60000);
        });
        apply(collect(document.body));
      } catch {
        chunk.forEach(source => retryAfter.set(source, Date.now() + 60000));
        break;
      }
    }
    persist();
  } finally {
    running = false;
    if (enabled && currentSession !== session) schedule();
  }
}
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => { translatePage().catch(() => {}); }, 250);
}
export function enableUrdu() {
  document.documentElement.lang = 'ur'; document.documentElement.dir = 'rtl';
  document.body.classList.add('lang-ur');
  if (enabled) { schedule(); return; }
  enabled = true; session++;
  observer = new MutationObserver(schedule);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label', 'alt'] });
  safetyTimer = setInterval(schedule, 3000);
  schedule();
}
export function disableUrdu() {
  enabled = false; session++; controller?.abort(); observer?.disconnect();
  clearTimeout(timer); clearInterval(safetyTimer);
  document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr';
  document.body.classList.remove('lang-ur');
}
