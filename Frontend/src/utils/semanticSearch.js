/**
 * In-browser semantic search using transformers.js — completely free and
 * keyless. The embedding model (all-MiniLM-L6-v2, ~23MB quantized) is fetched
 * once from the HuggingFace CDN and cached by the browser; spot embeddings are
 * cached in localStorage so repeat searches are instant. The heavy library is
 * dynamically imported so it never touches the main bundle.
 */

const MODEL = "Xenova/all-MiniLM-L6-v2";
const CACHE_KEY = "mm-embed-cache-v1";

let libPromise = null;
let extractorPromise = null;

async function lib() {
  if (!libPromise) libPromise = import("@xenova/transformers");
  return libPromise;
}

async function getExtractor() {
  if (!extractorPromise) {
    const { pipeline, env } = await lib();
    env.allowLocalModels = false; // fetch from CDN, don't look for local files
    extractorPromise = pipeline("feature-extraction", MODEL, { quantized: true });
  }
  return extractorPromise;
}

/** Embed a single string → normalized 384-dim vector (plain array). */
export async function embed(text) {
  const extractor = await getExtractor();
  const out = await extractor(String(text || " "), { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

// Cosine similarity of two normalized vectors = dot product.
export function similarity(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

const loadCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
};
const saveCache = (c) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* quota */ }
};

/**
 * Ensure every item has an embedding, using a cache keyed by id + a text hash so
 * edited descriptions get re-embedded. `onProgress(done, total)` reports the
 * one-time embedding pass. Returns items with a `_vec` field.
 * @param items [{ id, text, ... }]
 */
export async function ensureEmbeddings(items, onProgress) {
  const cache = loadCache();
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  const missing = items.filter((it) => {
    const c = cache[it.id];
    return !c || c.h !== hash(it.text);
  });

  let done = 0;
  for (const it of missing) {
    cache[it.id] = { h: hash(it.text), v: await embed(it.text) };
    done++;
    onProgress?.(done, missing.length);
  }
  if (missing.length) saveCache(cache);

  return items.map((it) => ({ ...it, _vec: cache[it.id]?.v }));
}

/** Rank embedded items against a free-text query. */
export async function semanticRank(query, embeddedItems, topK = 12) {
  const qv = await embed(query);
  return embeddedItems
    .filter((it) => it._vec)
    .map((it) => ({ ...it, _score: similarity(qv, it._vec) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, topK);
}
