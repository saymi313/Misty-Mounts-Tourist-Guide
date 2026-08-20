const express = require("express");
const router = express.Router();
const TouristSpot = require("../AdminBackend/models/TouristSport");
const TourPackage = require("../UserBackend/models/tourPackage");

/**
 * AI Concierge ("Ask Misty"). Uses Google Gemini's FREE tier (set GEMINI_API_KEY
 * in Backend/.env) with retrieval-augmented context from the live catalog. If no
 * key is configured — or the call fails — it degrades gracefully to a keyword
 * responder built from the same catalog, so the assistant always answers.
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const SYSTEM = `You are "Misty", the friendly travel concierge for Misty Mounts — a travel platform for Northern Pakistan (Gilgit-Baltistan, Khyber Pakhtunkhwa, Azad Kashmir).
Help travellers discover spots, plan day-by-day trips, pick tours, and stay safe. Be warm, concise and practical.
- When suggesting specific places or tours, prefer ones from the CATALOG provided below.
- For any emergency, tell them to call Rescue 1122.
- If asked to plan a trip, give a short day-by-day outline.
- Reply in the same language the traveller uses (English or Urdu).
- Keep answers under ~180 words unless asked for detail.`;

// Assemble a compact catalog context (kept small to stay within free limits).
async function buildContext() {
  const spotDocs = await TouristSpot.find({}).limit(40).lean();
  const spots = [];
  for (const c of spotDocs) {
    for (const p of (c.nearbyPlaces || []).slice(0, 6)) {
      spots.push({ name: p.name, city: c.city, desc: (p.description || "").slice(0, 120), activities: p.activities || [] });
    }
  }
  const tourDocs = await TourPackage.find({ isApproved: true, isPublished: true }).limit(15).lean();
  const tours = tourDocs.map((t) => ({
    title: t.title, cities: t.cities || [], days: t.durationDays, price: t.pricePerPerson,
  }));
  return { spots, tours };
}

function contextText({ spots, tours }) {
  const s = spots.map((x) => `- ${x.name} (${x.city}): ${x.desc}`).join("\n");
  const t = tours.map((x) => `- Tour: ${x.title} — ${x.days} days in ${x.cities.join(", ")}, from PKR ${x.price}`).join("\n");
  return `CATALOG SPOTS:\n${s || "(none yet)"}\n\nTOURS:\n${t || "(none yet)"}`;
}

// Keyword fallback when there's no API key or the LLM call fails.
function fallbackReply(messages, ctx) {
  const q = (messages[messages.length - 1]?.text || "").toLowerCase();
  const hit = (x) => `${x.name} ${x.city} ${x.desc} ${(x.activities || []).join(" ")}`.toLowerCase();
  const matches = ctx.spots.filter((x) => q.split(/\s+/).some((w) => w.length > 3 && hit(x).includes(w))).slice(0, 5);
  if (/emergency|help|sos|accident|hurt|1122|rescue/.test(q)) {
    return "In an emergency call **Rescue 1122** immediately. Open the Safety page to share your live location and see nearby hospitals.";
  }
  if (matches.length) {
    return "Here are a few spots that might fit:\n" + matches.map((m) => `• ${m.name} (${m.city})`).join("\n") +
      "\n\nOpen any spot for live weather, a map and local guides. Try the Trip Planner to turn these into a day-by-day plan.";
  }
  return "I can help you discover spots, plan a trip, find guides or tours, and stay safe in Northern Pakistan. Try asking things like \"plan 4 days in Hunza\" or \"quiet lakes near Skardu\". You can also use the Trip Planner and Safety pages.";
}

router.post("/chat", async (req, res) => {
  try {
    let { messages } = req.body || {};
    if (typeof messages === "string") messages = [{ role: "user", text: messages }];
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: "messages required" });
    }
    // Trim to the last 10 turns and cap length.
    messages = messages.slice(-10).map((m) => ({
      role: m.role === "model" || m.role === "assistant" ? "model" : "user",
      text: String(m.text || "").slice(0, 2000),
    }));

    const ctx = await buildContext();

    if (!GEMINI_KEY) {
      return res.json({ text: fallbackReply(messages, ctx), fallback: true });
    }

    const body = {
      systemInstruction: { parts: [{ text: `${SYSTEM}\n\n${contextText(ctx)}` }] },
      contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    };

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    if (!r.ok) {
      console.error("gemini error", r.status, (await r.text()).slice(0, 300));
      return res.json({ text: fallbackReply(messages, ctx), fallback: true });
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || fallbackReply(messages, ctx);
    res.json({ text });
  } catch (err) {
    console.error("ai chat error:", err.message);
    res.status(500).json({ error: "ai failed" });
  }
});

// ── Review summaries ─────────────────────────────────────────────────────────

function fallbackSummary(reviews, avg) {
  const text = reviews.map((r) => r.text.toLowerCase()).join(" ");
  const pick = (words) => words.filter((w) => text.includes(w));
  const pros = pick(["views", "friendly", "clean", "peaceful", "beautiful", "helpful", "value"]).slice(0, 3);
  const cons = pick(["cold", "expensive", "crowded", "rough road", "slow", "dirty", "noisy"]).slice(0, 3);
  return {
    summary: `Rated ${avg.toFixed(1)}/5 across ${reviews.length} traveller review${reviews.length !== 1 ? "s" : ""}.`,
    pros,
    cons,
    rating: Number(avg.toFixed(1)),
    fallback: true,
  };
}

router.post("/summarize", async (req, res) => {
  try {
    let { reviews, subject } = req.body || {};
    if (!Array.isArray(reviews) || reviews.length < 2) {
      return res.status(400).json({ error: "need at least 2 reviews" });
    }
    reviews = reviews.slice(0, 40).map((r) => ({
      rating: Number(r.rating) || 0,
      text: String(r.text || r.comment || "").slice(0, 500),
    }));
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    if (!GEMINI_KEY) return res.json(fallbackSummary(reviews, avg));

    const prompt =
      `Summarize these ${reviews.length} traveller reviews${subject ? ` for "${subject}"` : ""}. ` +
      `Return JSON with keys: "summary" (one warm sentence, max 30 words), ` +
      `"pros" (array of up to 3 short phrases), "cons" (array of up to 3 short phrases).\n\n` +
      reviews.map((r, i) => `${i + 1}. (${r.rating}/5) ${r.text}`).join("\n");

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 400, responseMimeType: "application/json" },
    };
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    if (!r.ok) {
      console.error("gemini summarize", r.status);
      return res.json(fallbackSummary(reviews, avg));
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    let parsed;
    try { parsed = JSON.parse(text); } catch { return res.json(fallbackSummary(reviews, avg)); }
    res.json({
      summary: parsed.summary || fallbackSummary(reviews, avg).summary,
      pros: Array.isArray(parsed.pros) ? parsed.pros.slice(0, 3) : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons.slice(0, 3) : [],
      rating: Number(avg.toFixed(1)),
    });
  } catch (err) {
    console.error("ai summarize error:", err.message);
    res.status(500).json({ error: "summarize failed" });
  }
});

module.exports = router;
