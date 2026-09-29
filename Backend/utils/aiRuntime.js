const crypto = require('node:crypto');

// Bounded, process-local caches: never persist conversations or personal details.
class Cache {
  constructor(max = 200, ttl = 300000) { this.max = max; this.ttl = ttl; this.entries = new Map(); }
  get(key) {
    const entry = this.entries.get(key);
    if (!entry || entry.expires <= Date.now()) { this.entries.delete(key); return undefined; }
    return entry.value;
  }
  set(key, value) {
    this.entries.delete(key);
    if (this.entries.size >= this.max) this.entries.delete(this.entries.keys().next().value);
    this.entries.set(key, { value, expires: Date.now() + this.ttl });
    return value;
  }
}
const cache = new Cache();
let windowStart = Date.now(), calls = 0, active = 0;
const metrics = { calls: 0, inputTokens: 0, outputTokens: 0, failures: 0 };
async function generate(system, contents, json = false) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (Date.now() - windowStart >= 86400000) { windowStart = Date.now(); calls = 0; }
  if (calls >= (Number(process.env.AI_DAILY_CALL_LIMIT) || 200) || active >= 4) return null;
  calls++; active++; metrics.calls++;
  try {
    if (!await require('./aiQuota').claimDailyCall(Number(process.env.AI_DAILY_CALL_LIMIT) || 200)) return null;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', signal: AbortSignal.timeout(20000),
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096, ...(json ? { responseMimeType: 'application/json' } : {}) } }),
    });
    if (!response.ok) throw new Error(`Provider status ${response.status}`);
    const data = await response.json();
    metrics.inputTokens += data.usageMetadata?.promptTokenCount || 0;
    metrics.outputTokens += data.usageMetadata?.candidatesTokenCount || 0;
    console.info('AI usage', JSON.stringify(metrics));
    const text = data.candidates?.[0]?.content?.parts?.filter(p => !p.thought).map(p => p.text || '').join('');
    return json ? JSON.parse(text) : text || null;
  } catch { metrics.failures++; return null; }
  finally { active--; }
}
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
module.exports = { Cache, cache, generate, hash };
