const express = require("express");
const router = express.Router();

/**
 * Free translation proxy (no API key). Primary: Google's public gtx endpoint;
 * fallback: MyMemory. Results are cached in memory across all users so repeated
 * UI strings are returned instantly. The frontend also caches per-browser, so
 * each unique string is fetched at most once, ever.
 */

const cache = new Map(); // key: `${source}:${target}:${text}` -> translated
const MAX_CACHE = 50000;

function cacheSet(key, val) {
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
  cache.set(key, val);
}

async function viaGoogle(text, source, target) {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx` +
    `&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`google ${res.status}`);
  const data = await res.json();
  const out = (data[0] || []).map((seg) => seg[0]).join("");
  if (!out) throw new Error("google empty");
  return out;
}

async function viaMyMemory(text, source, target) {
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}` +
    `&langpair=${source}|${target}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`mymemory ${res.status}`);
  const data = await res.json();
  const out = data && data.responseData && data.responseData.translatedText;
  if (!out) throw new Error("mymemory empty");
  return out;
}

async function translateOne(text, source, target) {
  const key = `${source}:${target}:${text}`;
  if (cache.has(key)) return cache.get(key);
  let out;
  try {
    out = await viaGoogle(text, source, target);
  } catch {
    try {
      out = await viaMyMemory(text, source, target);
    } catch {
      out = text; // give back the original rather than failing the whole batch
    }
  }
  cacheSet(key, out);
  return out;
}

// Run `fn` over items with a bounded concurrency, preserving order.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

router.post("/", async (req, res) => {
  try {
    const target = String((req.body && req.body.target) || "ur");
    const source = String((req.body && req.body.source) || "en");
    let q = req.body && req.body.q;
    if (typeof q === "string") q = [q];
    if (!Array.isArray(q)) {
      return res.status(400).json({ error: "q must be a string or an array of strings" });
    }
    q = q.slice(0, 200).map((s) => (s == null ? "" : String(s)));
    if (target === source) return res.json({ translations: q });

    const translations = await mapLimit(q, 8, (text) =>
      text.trim() ? translateOne(text, source, target) : Promise.resolve(text)
    );
    res.json({ translations });
  } catch (err) {
    console.error("translate error:", err.message);
    res.status(500).json({ error: "translation failed" });
  }
});

module.exports = router;
