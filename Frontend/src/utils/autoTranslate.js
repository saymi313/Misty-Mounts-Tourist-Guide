import api, { LIVE } from "../data/api";

/**
 * Runtime whole-page translator (English → Urdu) with no paid API.
 *
 * When Urdu is enabled we walk the live DOM, translate every English text node
 * and key attributes through the backend `/api/translate` proxy (free Google /
 * MyMemory), then cache the results in localStorage so the page stays instant on
 * every later visit. A MutationObserver keeps newly-rendered content (route
 * changes, async data) translated too. Switching back to English reloads the
 * page, which is the cleanest way to restore the original source strings.
 */

const CACHE_KEY = "mm-tr-cache-ur";
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "SVG", "PATH",
]);
const ATTRS = ["placeholder", "title", "aria-label", "alt"];

let cache = loadCache();
let enabled = false;
let observer = null;
let scheduleTimer = null;
let saveTimer = null;
let safetyTimer = null;
let lastRun = 0;
let indicatorEl = null;
let warnedNotLive = false;

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}
function saveCache() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* quota */ }
  }, 600);
}

const hasLatin = (s) => /[A-Za-z]/.test(s);
const hasUrdu = (s) => /[؀-ۿ]/.test(s);
// Only translate strings that contain English letters and aren't already Urdu —
// this also makes re-scans idempotent (translated nodes are skipped).
const translatable = (s) => !!s && s.trim().length > 0 && hasLatin(s) && !hasUrdu(s);

// Build a flat list of { key, apply } jobs for text nodes + key attributes.
function collectJobs(root) {
  const jobs = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      if (p.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      return translatable(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let next;
  while ((next = walker.nextNode())) {
    const node = next; // capture per-iteration — closures must not share one binding
    const raw = node.nodeValue;
    const lead = raw.match(/^\s*/)[0];
    const trail = raw.match(/\s*$/)[0];
    jobs.push({
      key: raw.trim(),
      apply: (ur) => {
        if (!node.parentNode) return; // node was removed since it was collected
        const val = lead + ur + trail;
        if (node.nodeValue !== val) node.nodeValue = val;
      },
    });
  }

  const els = root.querySelectorAll ? root.querySelectorAll("[placeholder],[title],[aria-label],[alt]") : [];
  els.forEach((el) => {
    if (el.closest("[data-no-translate]")) return;
    ATTRS.forEach((attr) => {
      const v = el.getAttribute(attr);
      if (translatable(v)) {
        jobs.push({
          key: v.trim(),
          apply: (ur) => { if (el.getAttribute(attr) !== ur) el.setAttribute(attr, ur); },
        });
      }
    });
  });

  return jobs;
}

function applyCached(jobs) {
  const misses = new Set();
  for (const job of jobs) {
    const hit = cache[job.key];
    if (hit != null) job.apply(hit);
    else misses.add(job.key);
  }
  return [...misses];
}

async function translatePage() {
  if (!enabled) return;
  lastRun = Date.now();

  let need;
  try {
    need = applyCached(collectJobs(document.body));
  } catch (e) {
    console.warn("[autoTranslate] DOM scan failed:", e);
    return;
  }

  if (!LIVE) {
    if (!warnedNotLive) {
      warnedNotLive = true;
      console.warn(
        "[autoTranslate] Cannot translate: VITE_API_URL is not set (LIVE=false), " +
        "so there's no backend to call. Set it in Frontend/.env and restart `npm run dev`."
      );
    }
    return;
  }
  if (!need.length) return;

  showIndicator(true);
  try {
    for (let i = 0; i < need.length; i += 100) {
      const chunk = need.slice(i, i + 100);
      const { data } = await api.post("/translate", { q: chunk, target: "ur", source: "en" });
      const arr = (data && data.translations) || [];
      chunk.forEach((k, idx) => { cache[k] = arr[idx] || k; });
    }
    saveCache();
    applyCached(collectJobs(document.body)); // apply freshly cached + any new nodes
    console.info(`[autoTranslate] translated ${need.length} new string(s) → Urdu`);
  } catch (e) {
    console.warn("[autoTranslate] translation request failed:", e?.message || e);
  } finally {
    showIndicator(false);
  }
}

// Debounced, but with a hard ceiling so a page that mutates every frame
// (framer-motion) can't starve the re-translate forever.
function schedule() {
  clearTimeout(scheduleTimer);
  if (Date.now() - lastRun > 1200) { translatePage(); return; }
  scheduleTimer = setTimeout(translatePage, 250);
}

function showIndicator(on) {
  if (on) {
    if (indicatorEl) return;
    const el = document.createElement("div");
    el.dir = "rtl";
    el.textContent = "اردو میں ترجمہ ہو رہا ہے…";
    el.style.cssText =
      "position:fixed;z-index:9999;bottom:16px;left:16px;padding:8px 14px;" +
      "border-radius:9999px;background:#a3e635;color:#0b110d;font-weight:700;" +
      "font-size:14px;box-shadow:0 8px 24px -8px rgba(0,0,0,.5);font-family:'Noto Nastaliq Urdu','Noto Naskh Arabic',sans-serif;";
    document.body.appendChild(el);
    indicatorEl = el;
  } else if (indicatorEl) {
    indicatorEl.remove();
    indicatorEl = null;
  }
}

export function enableUrdu() {
  document.documentElement.setAttribute("lang", "ur");
  document.documentElement.setAttribute("dir", "rtl");
  document.body.classList.add("lang-ur");
  if (enabled) { schedule(); return; }
  enabled = true;
  console.info("[autoTranslate] Urdu enabled — scanning page. LIVE:", LIVE);
  observer = new MutationObserver(schedule);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  // Safety net: re-scan periodically in case late-rendered content or heavy
  // animation slipped past the observer/debounce.
  safetyTimer = setInterval(() => { if (enabled) translatePage(); }, 2500);
  translatePage();
}

export function disableUrdu() {
  enabled = false;
  if (observer) { observer.disconnect(); observer = null; }
  if (safetyTimer) { clearInterval(safetyTimer); safetyTimer = null; }
  document.documentElement.setAttribute("lang", "en");
  document.documentElement.setAttribute("dir", "ltr");
  document.body.classList.remove("lang-ur");
}
