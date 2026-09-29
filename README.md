<div align="center">

**An AI-powered travel experience for Pakistan.**

# ⛰️ Misty Mounts

### A cinematic, full‑stack travel marketplace for Northern Pakistan

Discover the valleys of Gilgit‑Baltistan and beyond — browse spots, book stays and group tours, plan a trip in seconds, chat with real local guides, and travel safe with **live weather**, **hazard alerts** and a one‑tap **SOS**. Now fully bilingual — **English & اردو**.

<br/>

![Stack](https://img.shields.io/badge/stack-MERN-1f9d55?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-38bdf8?style=for-the-badge&logo=react&logoColor=white)
![Node](https://img.shields.io/badge/Node-Express-3c873a?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-13aa52?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-a3e635?style=for-the-badge)

</div>

---

## ✨ Overview

**Misty Mounts** is a **five‑role** MERN marketplace:

| Role | What they do |
| :--- | :--- |
| 🧭 **Traveller** | Discover spots, plan trips, book stays & group tours, save & review, chat with guides, travel safe. |
| 🏔️ **Local Guide** | Curate tourist spots, post safety alerts, answer travellers in real time. |
| 🏨 **Hotel** | List stays, manage bookings, track revenue & request payouts. |
| 🚐 **Travel Agency** | Build tour packages with fixed group departures, manage bookings, revenue & payouts. |
| 🛡️ **Admin** | Approve accounts & listings, manage content, verify payments, oversee revenue. |

The frontend is an immersive, dark **“night + lime”** bento UI (React + Vite + Tailwind + Framer Motion), with a parallax storytelling landing page. It runs against the live API when configured, and **gracefully falls back to a built‑in dummy‑data layer** when it isn't — so you can demo the whole UI with zero backend.

> **AI is optional.** Basic catalogue planning and demo search work without a Gemini key. AI features use your configured Gemini account and its pricing/quotas; weather uses Open-Meteo.

### Artificial intelligence, with Pakistan at heart

Misty Mounts brings AI assistance to Pakistani tourism, helping travellers discover our homeland and supporting the local people who welcome them.

| AI feature | What it helps with |
| :--- | :--- |
| **Ask Misty** | Conversational travel assistance grounded in the public destination catalogue. |
| **AI itinerary planning** | Editable plans based on dates, interests, group size and estimated PKR costs, with catalogue validation. |
| **Multilingual discovery** | Interpreting English, Urdu and Roman Urdu searches to retrieve relevant places. |
| **Urdu translation** | Translating complete sentences, with reviewed phrases and preferred name spellings. |
| **Review summaries** | Summarising available traveller reviews to help visitors compare experiences. |
| **Provider writing assistance** | Editable listing descriptions and guest replies for hotel owners and local guides. |

Gemini features activate when the live backend has a configured key. Missing configuration is shown as **Under construction**; provider failures retain the documented fallbacks or availability messages. Recommendations and weather-based itinerary adjustments also support planning, but do not require Gemini. AI suggestions do not confirm bookings, prices or route safety.

---

## 🚀 Features

### 🧭 Traveller
- Destination discovery with advanced filters, interactive **Leaflet map**
- Spot detail with **live 7‑day weather & "best time to visit"** (Open‑Meteo, free)
- **Group tours** — browse, detail, and book fixed departures with seat reservation
- Hotel & food **booking with escrow payment** (proof upload → admin verify) and PKR pricing
- **Trip Planner** (`/plan`) builds AI-assisted, catalogue-validated itineraries with dates, group size, estimated PKR costs and editable preferences. Basic planning remains available without AI. Weather suggestions can swap activities between suitable dates before saving to Trip Builder.
- **Trip Builder** (shareable) · **Wishlist** ❤️ · **Saved spots** · **My bookings**
- **Safety toolkit** — one‑tap SOS live‑location share, emergency dial, live hazard alerts
- **Real‑time 1:1 chat** with local guides (presence + typing)
- **Photo reviews** & ratings · **Notifications** centre · **Profile** + avatar
- **Bilingual** — whole‑site English ⇄ اردو runtime translation (RTL + Nastaʿlīq)
- **Installable PWA** — works offline for saved trips & maps

### 🏔️ Local Guide · 🏨 Hotel · 🚐 Travel Agency
- Shared dashboard kit (night mode, notifications, revenue) tailored per role
- **Guide:** tourist‑spot CRUD (photo upload), natural‑disaster safety alerts, real‑time inbox, reviews
- **Hotel:** accommodation listings, bookings, revenue & payout requests
- **Travel Agency:** tour packages + **fixed group departures**, bookings, revenue & payouts

### 🛡️ Admin
- **Two‑gate approvals** — vet accounts (guide/hotel/agency) and individual listings/packages, with auto‑approve toggles
- Spots / accommodations / transport / tours CRUD · **payment verification** · **payout approval**
- Revenue & content analytics · queries inbox with **email replies** · secure login

**Platform‑wide:** unified JWT auth · email **OTP verification** · **Cloudinary** image uploads · persisted Socket.io chat with presence · role‑based route protection · server‑side validation · **SEO** (JSON‑LD structured data, sitemap, per‑page meta) · **verified‑guide badges**.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18 · Vite · Tailwind CSS 3 · Framer Motion · Lenis · React Router · Axios · Socket.io‑client · Leaflet / react‑leaflet · PWA (service worker + manifest) |
| **Backend** | Node.js · Express 4 · MongoDB (Atlas) · Mongoose 8 · Socket.io 4 · JWT · bcryptjs |
| **Free integrations** | ☁️ Cloudinary (images) · ✉️ SMTP via Nodemailer (OTP + query replies) · 🌦️ **Open‑Meteo** (weather, no key) · 🌐 **Google gtx + MyMemory** translation proxy (no key) |

---

## 🗂️ Project Structure

```
Misty-Mounts-Tourist-Guide/
├─ Backend/
│  ├─ AdminBackend/          # admin auth + spots/accommodations/transport/tours/settings/stats
│  ├─ LocalGuidePannel/      # user & guide auth (OTP), tourist spots, disasters, User model
│  ├─ UserBackend/           # profile, saved, bookings, tours, messages, notifications, payments
│  ├─ HotelPannel/           # hotel listings, bookings, revenue
│  ├─ TravelAgencyPannel/    # tour packages, group departures, tour bookings
│  ├─ routes/                # uploadRoutes, hotelRoutes, travelAgencyRoutes, tourRoutes, translateRoutes
│  ├─ middleware/            # auth.js (authenticate / requireRole / requireAdmin)
│  ├─ utils/                 # mailer, slug helpers
│  └─ server.js              # Express + Socket.io (JWT socket auth, presence, typing)
└─ Frontend/
   ├─ public/                # Logo, images, manifest, robots.txt, sitemap.xml
   └─ src/
      ├─ UserPanel/          # traveller pages & components (night/lime bento)
      │  └─ pages/           # Destination, CityDetail, Tours, TourDetail, Guides, TripPlanner, Safety, ...
      ├─ AdminFrontend/      # admin dashboard
      ├─ LocalGuidePannel/   # guide dashboard
      ├─ HotelPannel/        # hotel dashboard
      ├─ TravelAgencyPannel/ # travel agency dashboard
      ├─ components/         # WeatherWidget, SosCard, HazardAlerts, Seo, VerifiedBadge, ExploreMap, chat, ...
      ├─ context/            # AuthContext (auth + socket), I18nContext (EN/UR), ThemeContext
      ├─ data/               # api.js, mockApi.js, adminApi.js, toursApi.js, agencyApi.js, geo.js, safety.js
      └─ utils/              # weather.js, tripPlanner.js, autoTranslate.js, stores, validation, currency
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** ≥ 18 and npm
- A **MongoDB** connection string (Atlas or local)
- *(optional for full features)* **Cloudinary** account + **SMTP** credentials

### 1 · Clone
```bash
git clone <your-repo-url>
cd Misty-Mounts-Tourist-Guide
```

### 2 · Configure environment
```bash
cp Backend/.env.example  Backend/.env
cp Frontend/.env.example Frontend/.env
```

### 3 · Backend — install, seed, run
```bash
cd Backend
npm install
npm run seed     # optional: populate MongoDB with demo content + accounts
npm run dev      # http://localhost:5000
```

### 4 · Frontend — install & run
```bash
cd ../Frontend
npm install
npm run dev      # http://localhost:5173
```

> 💡 **Dummy‑data mode:** delete `Frontend/.env` (or leave `VITE_API_URL` unset) and the app runs entirely on the built‑in mock layer — no backend required.

---

## 🔐 Environment Variables

**`Backend/.env`**

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign/verify all JWTs |
| `ADMIN_USERNAME` · `ADMIN_PASSWORD` | Admin credentials (never commit real values) |
| `PORT` | API port *(optional, default `5000`)* |
| `CLIENT_URL` | Allowed CORS/socket origin *(optional, default `http://localhost:5173`)* |
| `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` | Cloudinary image uploads |
| `EMAIL_HOST` · `EMAIL_PORT` · `EMAIL_SECURE` · `EMAIL_USER` · `EMAIL_PASS` · `SENDER_EMAIL` | SMTP (OTP + query replies) |
| `GEMINI_API_KEY` | Optional server-side key for Ask Misty, itinerary refinement, search expansion, review summaries and provider drafts. Never put this key in a `VITE_` variable. |
| `GEMINI_MODEL` | Provider model override; defaults to `gemini-2.5-flash`. Set a model available to your Gemini account. |
| `AI_DAILY_CALL_LIMIT` | Provider call cap per server process per 24-hour window; defaults to `200`. Counters reset on restart. |
| `VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `VAPID_SUBJECT` | *(optional)* Web-Push keys — generate with `npx web-push generate-vapid-keys`. Without them, push is disabled (in-app notifications still work). |
| `PAYMENT_PROVIDER` · `PAYMENT_API_KEY` · `PAYMENT_WEBHOOK_SECRET` · `PAYMENT_CREATE_URL` · `PAYMENT_CHECKOUT_URL` | *(optional)* Custom hosted-checkout adapter credentials. Generic checkout requires a webhook secret and the contract documented below; this is not a native Safepay/PayFast integration. Easypaisa is disabled pending authenticated reconciliation. |

**`Frontend/.env`**

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | API base, e.g. `http://localhost:5000/api` *(unset → dummy‑data mode)* |
| `VITE_SOCKET_URL` | Socket.io URL, e.g. `http://localhost:5000` |

> ⚠️ **Never commit real `.env` files.** They're git‑ignored; commit only the `.env.example` templates. If a secret was ever committed, **rotate it**.

---

## 👤 Demo Accounts

After `npm run seed`, sign in with the seeded demo users, or register a new account (each role has a sign‑up option). New sign‑ups go through **email OTP verification** (6‑digit code via SMTP, with a `dev OTP:` console fallback when SMTP is unavailable). Guide, hotel and travel‑agency accounts require **admin approval** before their listings go public.

> Admin credentials come from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `Backend/.env` — **not** hard‑coded.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

<details>
<summary><b>Auth</b></summary>

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/user/auth/signup` | Register (any role) + send OTP |
| `POST` | `/user/auth/verify-otp` · `/user/auth/resend-otp` | Verify / resend OTP |
| `POST` | `/user/auth/login` | Login (blocks unverified) |
| `POST` | `/admin/auth/login` | Admin login |
</details>

<details>
<summary><b>Traveller (auth required)</b></summary>

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET/PUT` | `/user/me` · `POST /user/avatar` | Profile & avatar |
| `GET/POST/DELETE` | `/user/saved[/:spotId]` | Saved spots |
| `POST` | `/payment/create` · `GET /payment/me` · `PATCH /payment/:id/cancel` | Bookings |
| `GET/POST` | `/tours` · `/tours/:id` · `/tours/book` | Browse & book group tours |
| `GET/POST` | `/messages/*` | 1:1 guide chat threads + unread count |
| `GET/PATCH/DELETE` | `/notifications*` | Notifications |
| `POST` | `/upload` | Image upload → Cloudinary |
| `POST` | `/translate` | Sentence-level EN→UR translation; optional Gemini with keyless fallback |
</details>

<details>
<summary><b>Providers (auth + role)</b></summary>

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET/POST/PUT/DELETE` | `/hotel/*` | Hotel listings & bookings |
| `GET/POST/PUT/DELETE` | `/agency/packages*` · `GET /agency/bookings` | Tour packages & bookings |
| `GET/POST/PUT/DELETE` | `/guide/*` · `/natural-disaster/*` | Guide spots & safety alerts |
| `GET` | `/payment/balance` · `/payouts/me` · `POST /payouts/request` | Revenue & payouts |
</details>

<details>
<summary><b>Content (public reads · staff writes)</b></summary>

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/admin/cities` · `/admin/spots[/:city]` · `/admin/places` | Tourist spots |
| `GET` | `/admin/accommodations[/:id]` · `/admin/transportation[/:spotId]` | Stays & transport |
| `GET` | `/feedback[/:locationName]` · `POST /feedback/submit` | Reviews |
| `GET` | `/natural-disaster/get-disaster` | Live safety / hazard alerts |
| `*` | `/admin/{users,tours,places,accommodations}` · approvals · stats | Admin management |
</details>

<details>
<summary><b>Realtime (Socket.io)</b></summary>

JWT‑authenticated sockets power **1:1 traveller ↔ guide messaging** (`message:new`, `messages:read`), **presence** (`presence:update` / `presence:list` / `presence:get`) and **typing** indicators. Messages persist to MongoDB.
</details>

---

## 🌦️ Weather, 🛡️ Safety & 🧭 Planning (free integrations)

- **Weather** — [Open‑Meteo](https://open-meteo.com) provides current + 7‑day forecasts directly in the browser (no key, CORS‑enabled). Spot coordinates fall back to city centroids (`data/geo.js`).
- **Safety** — `/safety` aggregates a live‑location **SOS** (browser Geolocation → WhatsApp/copy/map), real emergency numbers, and **hazard alerts** from the natural‑disaster API. Alerts also surface on relevant spot pages.
- **Trip Planner** (`/plan`) builds AI-assisted, catalogue-validated itineraries with dates, group size, estimated PKR costs and editable preferences. Basic planning remains available without AI. Weather suggestions can swap activities between suitable dates before saving to Trip Builder.
- **Translation** — Urdu translation groups complete text blocks, including sentences split across inline emphasis, so Urdu can use its own sentence order. Reviewed Urdu phrases cover core interface and mission copy. `/api/translate` uses Gemini when configured, with explicit natural Pakistani Urdu instructions, and falls back to Google/MyMemory on complete sentences. Interactive links and controls remain intact; sentences interrupted by controls still translate as separate fragments. Only successful translations are cached, and the versioned browser cache replaces older word-by-word results. Urdu uses RTL Nastaʿlīq. Run `cd Frontend && npm run test:i18n` for DOM regression tests and `cd Backend && npm test` for service tests.

---

## AI travel tools and weather-aware planning

Implemented: AI itineraries and estimates, catalogue-grounded chat, natural-language discovery, cached review summaries, weather-based activity swaps, and hotel/guide writing drafts.

### Traveller workflow

- **Ask Misty:** ask about destinations, hotels and tours, open related catalogue entries and save suggested spots to your trip. Retrieval uses ranked catalogue text; it is not a vector database search.
- **Trip Planner (`/plan`):** enter dates, departure city, group size, total budget, transport, interests and pace. AI selects real catalogue IDs; the server validates selections and calculates dates and costs. Refine preferences, review the estimated breakdown, then save to Trip Builder.
- **Discovery (`/discover`):** describe a destination in English, Urdu or Roman Urdu. AI expands the request into search terms; explicit region selection overrides cities mentioned in the query. Results show literal matching terms. Keyword search remains available when AI fails.
- **Personalized discovery:** recommendations combine selected interests with profile interests, saved spots, wishlist items and Trip Builder destinations. Each suggestion explains its match; previously saved spots are excluded and results are diversified across cities. Turn off profile/saved-item personalization at any time. Matching runs locally without an additional AI request; price and booking-history personalization are not implemented.
- **Weather adjustments:** expand Daily forecasts to see city-level Open-Meteo data, fetch timestamps and date-specific planning notes. Where a lower-concern day has fewer exposed outdoor stops, the planner offers a same-city activity swap. Apply or undo the last swap; dates, lodging and estimated costs stay fixed.
- **Guide reports:** unresolved reports matching the destination are shown with report dates and a link to Safety. Reports are not independently verified or treated as official road-closure confirmation.

Forecasts cover up to 16 days and are reused for up to 15 minutes. Dates outside the returned forecast, incomplete data and provider failures display an unavailable state. Suggestions use explicit weather rules, not AI-generated forecasts or official warnings. City-level forecasts do not establish conditions at a mountain trail. See the [Open-Meteo API documentation](https://open-meteo.com/en/docs).

### Weather data accuracy and provenance

- Weather comes directly from Open-Meteo, including in demo mode. The obsolete static-weather fixture/API/card and elevation-only seasonal advice have been removed.
- Requests explicitly specify Celsius, km/h, millimetres, ISO timestamps and `Asia/Karachi`. Responses are validated for units, timezone, dates and numeric ranges. Null, missing, malformed or inconsistent data displays as unavailable instead of zero or clear sky. Valid provider numbers retain their numeric precision.
- Spot coordinates are used when valid; otherwise the UI clearly labels a city-centre estimate. Requested coordinates, the returned model-grid coordinates, provider links and Pakistan-time timestamps are displayed. Model elevation is labelled separately from a surveyed spot elevation.
- Current conditions are model estimates, not local weather-station observations. Their **valid-at time** is distinct from the fetch time. Current values older than 90 minutes or more than 15 minutes in the future are not displayed as current conditions.
- Weather panels refresh every 15 minutes while visible and when the tab becomes visible. Manual refresh bypasses the trip forecast cache, and network requests bypass the browser HTTP cache. Failures show an unavailable state; no synthetic weather is substituted.
- No weather forecast can promise exact conditions at a specific mountain location. The app displays authentic provider data with its location and timing limits, rather than claiming measured ground truth. Precipitation probability is the provider's daily maximum probability and includes precipitation generally, not just rain. Wind statistics are at 10 metres above ground.

### Hotel and guide writing assistant

Open **AI writing assistant** inside a hotel listing or guide spot add/edit form. Choose:

1. Write a description using the supplied listing facts.
2. Translate the current description into English or Urdu.
3. Draft a guest reply from a pasted message.
4. Draft a review response from pasted review text.

Review and edit the result, then use it as the description or copy the draft. Replies are never sent automatically, and descriptions still require the usual Save action and approval workflow. Urdu drafts use right-to-left editing. Facts and source text are sent to the configured AI provider; omit private guest details. Drafts are not cached or logged by this application. Provider failure preserves existing content and offers a retry.

### Enable and test

In `Backend/.env`:

```dotenv
GEMINI_API_KEY=your_server_side_key
GEMINI_MODEL=gemini-2.5-flash
AI_DAILY_CALL_LIMIT=200
```

In `Frontend/.env`, point `VITE_API_URL` to your backend API, for example `http://localhost:5000/api`. Restart both servers after changing configuration. Use an authenticated **hotel** or **local guide** account for writing tools. In demo mode, discovery keeps browser embeddings and planning stays basic; provider drafts require the backend. Weather does not require a Gemini key.

```bash
cd Backend
npm test
cd ../Frontend
npm run build
```

Tests cover catalogue filtering, AI-output validation, request limits, budget arithmetic, blackout dates, draft permissions/failures, missing forecasts and activity swaps. Tests stub the AI provider and do not spend API credits.

### AI API

All paths below are relative to `/api`.

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| POST | `/ai/chat` | Public, rate limited | Catalogue-grounded conversation and related links |
| POST | `/ai/plan` | Public, rate limited | Validated itinerary and estimated group budget |
| POST | `/ai/search` | Public, rate limited | Query expansion and region-filtered catalogue results |
| POST | `/ai/summarize` | Public, rate limited | Review summary, pros and cons |
| POST | `/ai/draft` | Hotel/local guide JWT | Editable description, translation or reply draft |

Draft requests accept `mode` (`description`, `translate`, `guest-reply`, `review-reply`), `language` (`en`, `ur`), a `facts` object and `source` text for translation/replies. Each fact/source is limited to 3,000 characters. Plan requests accept `days`, `people`, `budget`, `startDate`, `region`, `departure`, `transport`, `pace`, `interests` and `instructions`. Natural-language preferences do not override structured date, budget or group fields.

### Limits and operational notes

- AI endpoints share a 30-request/hour quota per authenticated account, or per IP for anonymous clients, alongside existing API limits. Provider requests time out after 20 seconds and permit at most four concurrent calls per server process.
- Catalogue context is cached for one minute; review summaries and search interpretations for five minutes. Approval and listing changes can take up to one minute to appear in AI context.
- Usage logs contain aggregate token counts, not prompts or currency costs. Caches and spending counters are process-local and reset on restart; multiple server instances need shared counters for a global cap.
- Plans currently use one base city. Road travel times, activity durations, entry fees, flights and departure-city transfers are not calculated. The departure field supplies context rather than a verified route.
- Budget totals are estimates: food is PKR 1,800/person/day; transport is PKR 3,500/day for an own car, PKR 1,500/person/day for public transport or PKR 10,000/day for a rental, plus 15% contingency. Lodging uses eligible catalogue prices, two people per room, and blackout-night checks; actual room capacity and availability must be confirmed. Missing lodging prices mark totals incomplete.
- Accessibility, crowd levels, distance and price requirements are not verified discovery filters. AI wording, translations and replies require human review.
- Gemini and weather integrations remain subject to provider availability, terms and quotas. For deployment, check the provider plans appropriate to your use.

---

## 📜 Scripts

| Backend | Frontend |
| :--- | :--- |
| `npm run dev` — nodemon | `npm run dev` — Vite dev server |
| `npm start` — start server | `npm run build` — production build |
| `npm run seed` — seed demo content | `npm run preview` — preview build |
| `npm test` - automated backend and planning checks | `npm run lint` - frontend lint |

---

## 🛡️ Security

- Passwords & OTPs hashed with **bcryptjs**; JWTs signed with a single secret.
- Sensitive listing, booking and provider operations require authentication and role checks. Public AI endpoints are rate limited; writing drafts requires a hotel or local guide account.
- Server‑side validation on all forms; CORS locked to `CLIENT_URL`.
- Secrets live only in `.env` (git‑ignored) — **rotate any that were ever committed**.

---

## 🗺️ Roadmap

- [x] Live weather & "best time to visit" on spot detail
- [x] Safety toolkit — SOS, emergency contacts, live hazard alerts
- [x] Trip planner + shareable trip builder
- [x] Whole‑site English ⇄ Urdu translation
- [x] SEO (structured data, sitemap) + verified‑guide badges
- [x] Ask Misty: relevant approved catalogue context, linked results and save-to-trip controls
- [x] Natural-language search: AI term expansion, region filtering and keyword fallback; browser embeddings in demo mode
- [x] Weather-aware activity swaps with dated forecasts, source links and undo
- [x] Validated weather units, explicit spot/city provenance, timestamps and real refresh
- [x] Explained, local personalized destination recommendations
- [x] Hotel/guide AI descriptions, translations, guest replies and review response drafts
- [x] AI review summaries · admin analytics dashboard · verified‑booking review tags
- [x] Web‑push notifications (VAPID) + route code‑splitting
- [x] Real payments + escrow (gateway-agnostic Safepay/PayFast scaffolding — add sandbox keys to enable)
- [x] Guide KYC verification · referral program · email waitlist · founder metrics dashboard

---

## 📄 License

Released under the **MIT License**.

<div align="center">

<br/>

**Made in Pakistan, for the mountains of the north** ⛰️🇵🇰

</div>


## Supplier-confirmed trips and pilot operations

### Feature availability labels

The public `GET /api/features` endpoint exposes boolean availability flags only, never API keys or the WhatsApp number. Without `GEMINI_API_KEY`, Ask Misty, AI writing and AI review summaries display **Under construction** and do not send generation requests. AI refinements in planning and search carry the same notice while basic itinerary planning and keyword search remain usable. Urdu translation keeps its independent keyless fallback; browser-based demo search does not require Gemini.

To activate these features, put `GEMINI_API_KEY` in `Backend/.env` and set `GEMINI_MODEL` to a model available to your account (`gemini-3.1-flash-lite` was verified for this setup). The server resolves this file relative to its own directory, even when launched from the repository root. Restart the backend after editing environment variables; never put the key in a frontend `VITE_` variable. Existing pages recheck feature availability every 65 seconds and on window focus, with a shared one-minute cache. A configured key enables the controls, but provider quota or model errors can still trigger the documented fallbacks. Verify `/api/features` reports `gemini: true`, then exercise an in-scope catalogue question. Fixed greetings and refusals do not call Gemini, so those replies alone are not a provider health check. A fallback response means live classification was unavailable or could not be validated.

WhatsApp support displays **Under construction** until a valid `CONCIERGE_WHATSAPP_NUMBER` is configured. A configured number enables a clearly labeled human-support link. The automated WhatsApp concierge remains **Under construction** because automation is not implemented. Loading and failed availability checks are shown as checking availability or temporarily unavailable, rather than falsely claiming that a feature works.

Restart the backend after changing configuration and reload the page to refresh labels. Flags indicate configuration presence, not a successful provider health check; invalid keys, exhausted quotas and outages can still cause a configured feature to fail. The browser shares availability requests and caches their result for up to one minute during navigation.

The trip desk connects the existing AI planner to a supplier quote and a traceable booking lifecycle. It is a pilot workflow with manual supplier coordination, not instant inventory across every hotel or an automatic multi-supplier package reservation.

### Traveler and supplier flow

1. Generate an itinerary at `/plan` and choose **Request supplier quote**, or open `/trip-requests` directly. Review dates, budget, requirements and the editable itinerary before sending. AI estimates never become confirmed prices automatically.
2. Choose one approved supplier for a complete trip (travel agency), stay (hotel), guide, or transport (travel agency). A complete-trip agency is responsible for coordinating the full package; individual service requests are separate. Identity-document review is shown separately from account approval and does not certify service quality.
3. The selected supplier opens **Trip requests** in its panel (`/hotel/quotes`, `/local-guide/quotes`, `/travel-agency/quotes`), checks availability, and submits itemized PKR prices, payment instructions, cancellation/refund terms, exclusions and an expiry of up to seven days. The supplier explicitly commits to the availability hold; inventory is not reserved automatically in another system.
4. The traveler reviews and explicitly accepts the unexpired quote. No payment or booking action is authorized by the AI. Prices and the commission rate are stored with the quote.
5. Payment is verified through the hosted-checkout adapter or independently reconciled by an administrator at `/admin/trip-requests`. A browser return URL never proves payment. Manual recording requires the exact quote amount and an external bank/processor reference. It does not initiate a transfer.
6. After the final travel day, the traveler can confirm completion and leave one completed-trip review, visible on the trip record to the traveler, supplier and administrator. Public supplier review aggregation is not included yet.

A request can be declined or cancelled before payment. Paid trips support cancellation/refund requests; administrators record the actual amount and transaction reference after transferring a refund externally. Completed trips expose the agreed supplier payout amount; administrators likewise record payouts only after an external transfer. These records are separate from legacy hotel/tour revenue balances and must not be paid twice through those screens. No new escrow custody or automatic refunds/payouts are provided.

### Reliability and access

- Authentication and role checks restrict travelers to their requests and suppliers to requests addressed to them. Pending/unapproved suppliers cannot send quotes. Administrators handle payment reconciliation and support.
- Request keys have a unique per-traveler index, preventing duplicate submissions of the same request. Quote acceptance and status changes use optimistic concurrency checks. A new payment reference has a unique sparse index in trip requests; retries cannot credit the same reference to two custom trips.
- Expired quotes cannot be accepted or paid. Late or mismatched payment events require manual reconciliation; they do not resurrect cancelled trips.
- In-app support records a request, administrator resolution, and minutes spent. Trip history records state changes. Lists use 25-item pagination. Refresh status to fetch changes; real-time quote delivery is not implemented.
- MongoDB must create the `TripRequest` collection's unique indexes before accepting traffic. With automatic index creation disabled in production, provision the indexes from `Backend/models/TripRequest.js` in the deployment migration.

### Payment adapter contract and limitations

`PAYMENT_PROVIDER=manual` leaves hosted checkout disabled. The generic adapter requires `PAYMENT_API_KEY`, `PAYMENT_CREATE_URL` and `PAYMENT_WEBHOOK_SECRET`. It sends PKR **major units** (rupees), the booking reference and an `Idempotency-Key` equal to that reference. Your payment bridge must honor this key, return a hosted checkout URL, and ensure repeated checkout calls cannot create duplicate charges. This generic contract is not a claim of compatibility with a particular processor's native API.

Send JSON webhook bodies to `POST /api/pay/webhook`, signed as hexadecimal HMAC-SHA256 over the exact raw request body using the webhook secret in `x-signature`. Successful events must include `reference`, `status`, `transaction_id`, `amount` in PKR rupees and `currency: "PKR"` (the equivalent supported nested `data` fields also work). Only authenticated events matching the stored amount, currency and payable state settle a booking. Unknown, expired or mismatched events return an error for operational reconciliation. Deploy a provider sandbox reconciliation test before collecting customer funds.

JazzCash callbacks now require the secure hash, expected merchant ID, amount and PKR currency. Its merchant-specific integration still needs sandbox validation. **Easypaisa checkout is intentionally disabled:** its previously unsigned browser return cannot safely establish payment; merchant-approved server status verification must be integrated before enabling it. Credentials alone will not enable Easypaisa.

### WhatsApp concierge

Set `CONCIERGE_WHATSAPP_NUMBER` to the business number in international digits, e.g. `923001234567`. Travelers can explicitly open WhatsApp from a trip request with only its reference prefilled. The existing AI planner supplies the proposed itinerary. This release does **not** automatically send WhatsApp messages, ingest voice notes, or run an autonomous booking agent. A WhatsApp Business API account, inbound/outbound webhook integration, consent handling and human handoff are still required for that later phase.

### Metrics and pilot measurement

`/admin/trip-requests` shows the all-time request ? quoted ? accepted ? paid funnel, conversion rate, completed and cancelled/refunded trips, average supplier quote response time, gross booking value, refunds, earned commission, supplier payouts and recorded support minutes. Metrics come from server records, not client-submitted conversion events. They cover custom trip requests only, excluding legacy hotel/tour bookings. Gross booking value is not revenue; earned commission covers completed trips before acquisition costs, payment fees and support costs. Supplier payouts are actual recorded external transfers, not automatic disbursements.

For a pilot, recruit real suppliers, interview travelers and measure completed paid trips. No demo bookings, reviews, traction, or revenue are seeded into these metrics. Acquisition-cost attribution, repeat-customer cohorts and date-filtered reporting remain future improvements.

### Trip desk API

| Method | Path under `/api/trip-requests` | Access |
| --- | --- | --- |
| GET | `/config`, `/suppliers?service=complete%20trip` | Authenticated |
| GET | `/` (`?page=1`) | Own requests; administrator sees all |
| POST | `/` | Traveler; validated dates, requirements, supplier ID and request key |
| POST | `/:id/action` | Owner, assigned supplier or administrator, according to action/state |
| GET | `/metrics` | Administrator only |

Action names: `quote`, `decline`, `accept`, `cancel`, `record-payment`, `request-refund`, `record-refund`, `complete`, `review`, `support`, `resolve-support`, `record-payout`. The hosted checkout endpoint also accepts `{ "type": "trip", "ref": "TR-..." }`.


### Validation for this release

Run `cd Backend && node --test --test-concurrency=1 tests/*.test.js` for the backend suite. Trip-commerce tests cover input validation, authoritative quote totals, ownership/role checks, explicit acceptance, request retries, optimistic concurrency, payment/refund/payout transitions, completion-only reviews, signed callbacks and webhook idempotency. HTTP tests use stubbed persistence and payment evidence; they do not replace testing against a deployment database or a merchant sandbox. Run `cd Frontend && npm run build` for the production bundle.

Before a real-money pilot, exercise the full flow with separate traveler, supplier and administrator accounts against your test database, verify the unique indexes, and reconcile a successful, failed, duplicate and late payment with your chosen processor. Set the WhatsApp number only when the business support team is ready to receive messages.


## Search engine and AI-search discoverability

The production build renders public pages into HTML using Chromium, so their real headings, text, internal links and metadata are available before JavaScript runs. The snapshots come from the same React pages shown to visitors; there is no special bot-only content. React continues to provide interactive functionality after loading. Browser rendering is performed without a signed-in session, with service workers blocked, and with POST requests disabled to avoid creating bookings or triggering AI generation during a build.

### Production configuration

Set these frontend build variables for the real production deployment:

```dotenv
VITE_SITE_URL=https://your-real-public-domain.example
VITE_API_URL=https://your-api-domain.example/api
VITE_SOCKET_URL=https://your-api-domain.example
VITE_SEO_INDEXABLE=true
SEO_ALLOW_TRAINING=false
```

`VITE_SITE_URL` must be the final HTTPS origin, without paths, credentials, queries or fragments. Configure your host to redirect alternate domains (www/non-www and HTTP) to it. The repository's fallback `https://www.mistymounts.pk` is not proof of domain ownership. Keep `VITE_SEO_INDEXABLE=false` on staging, preview and demo deployments. Indexable builds require a live API and an explicit HTTPS site origin; builds fail if the approved catalogue cannot be fetched. Do not enable indexing for fixture/demo data.

```bash
cd Frontend
npm ci
npm run seo:install
npm run build
```

On Linux CI, use `npx playwright install --with-deps chromium --only-shell` if Chromium system dependencies are missing. `npm run build` runs Vite and SEO generation; `npm run build:client` only builds the interactive app and is not the recommended public deployment artifact. `npm run seo:generate` reruns generation on an existing bundle built with the same environment. The backend must already expose `GET /api/seo/catalog`.

### Generated files and hosting

- `dist/index.html` and public route `index.html` files: rendered page content with unique titles, descriptions, canonicals, Open Graph/Twitter metadata and appropriate structured data.
- `dist/sitemap.xml`: canonical public routes and approved destination, attraction, available accommodation, published tour and approved guide URLs. Only successfully rendered catalogue entries are published. No synthetic last-modified dates or invented priority scores are included.
- `dist/robots.txt`: search crawler access and sitemap location. Production permits public crawling, explicitly permits OAI-SearchBot and separately disallows GPTBot model-training crawling by default. Set `SEO_ALLOW_TRAINING=true` only if training access is wanted. Other crawlers follow the wildcard group; robots directives are not access control.
- `dist/llms.txt`: a supplementary public-page guide with factual product scope and limitations. It is not a search-engine requirement, ranking mechanism, or instruction to bypass private pages.
- `/site-map`: an HTML directory with ordinary crawlable links to the published public pages, linked from the footer.
- `dist/404.html`: a not-found page. Unknown URLs must return HTTP 404, not the home page with status 200.
- `dist/app-shell.html`: a non-indexable shell for account pages, private panels and interactive utilities; authenticated APIs remain the actual access control.

Select **Frontend as the project root** when using the supplied `Frontend/vercel.json` or `Frontend/netlify.toml`. Vercel serves the public snapshot directories, redirects `/user` to `/`, and rewrites only account/tool routes to the app shell. Netlify uses the generated `_redirects` and `_headers` in `dist`. Do not add a blanket `/* ? /index.html 200` rule: it hides not-found responses and serves homepage metadata on unrelated URLs. A generated `dist/hosting-vercel.json` is also available as an explicit-route reference for custom deployments; it is not automatically consumed by Vercel.

For another web server, serve exact public snapshot files first; redirect `/user` permanently to `/`; send private/tool routes to `app-shell.html` with `X-Robots-Tag: noindex, follow`; send unknown URLs to `404.html` with status 404. Keep assets available to crawlers. Fingerprinted `/assets/*` can be cached immutably; HTML, robots, sitemaps and service workers should revalidate. API responses carry `X-Robots-Tag: noindex` without blocking the frontend's public data requests.

### Metadata and content integrity

The shared SEO registry supplies public page defaults, and listing pages supply their actual titles, descriptions and images. Canonicals remove tracking parameters and fragments, normalize trailing slashes, and use `/` instead of `/user`. Route changes reset social images and structured data so a previously viewed listing cannot leak into another page's metadata. Private, utility, search-results and missing pages use `noindex`; they are excluded from the XML sitemap.

Structured data uses Organization, WebSite, WebPage, breadcrumbs and relevant visible listing entities. It does not invent reviews, prices, credentials, contact details or availability. Tour markup no longer claims every departure is in stock; guide markup does not advertise unsupported Person review stars; attraction coordinates never substitute a city centroid for the actual attraction location. Production homepage counters based on demo numbers are hidden, and featured review statistics derive from the displayed reviews.

`/travel-help` provides readable answers about proposed itineraries, confirmed quotes, identity review, payment records, refunds, weather limitations and Urdu support. These answers are visible to users as well as crawlers. Runtime Urdu translation shares the same URL with English, so no misleading Urdu `hreflang` links are emitted. Dedicated, editorially reviewed language URLs would be required for separate multilingual indexing.

### Publishing and maintenance

Rebuild and redeploy after approving, changing or withdrawing public listings. Snapshots and sitemaps reflect the catalogue at build time; newly added detail URLs are not immediately prerendered, and removed content remains in an older deployment until it is replaced. The export is bounded at 10,000 catalogue URLs; larger catalogues need paginated sitemap shards and incremental rendering before launch. Do not publish a failed build over the previous working deployment.

After deployment:

1. Verify the actual HTTPS domain in Google Search Console and Bing Webmaster Tools, then submit `/sitemap.xml`. Ownership verification and submission require the site owner's accounts; this code does not submit anything automatically.
2. Inspect representative home, destination, guide, stay and tour URLs. Confirm a 200 response, the intended canonical, readable initial HTML, correct public data and `index, follow` on production. Check private URLs for `noindex` and unknown URLs for a real 404.
3. Validate structured data with Google's Rich Results Test and Schema.org's validator. Valid schema does not guarantee a rich result; generic travel pages do not automatically qualify for FAQ or review-star enhancements.
4. Check mobile PageSpeed Insights / Core Web Vitals on the deployed site. Optimize measured LCP imagery, image dimensions and formats, animation and server latency rather than assuming a score from a local build.
5. Keep destination descriptions useful, accurate and maintained. Add genuine first-hand information, attributable sources and real supplier evidence where available. Do not mass-generate thin pages, fake reviews, backlinks or ranking claims.
6. Review search performance and referral logs over time. Crawl permissions do not guarantee indexing, rankings, citations or recommendations by an AI assistant.

Validation commands: `npm run test:seo` in Frontend and `node --test tests/seoCatalog.test.js` in Backend. The frontend suite checks canonical normalization, private-route exclusion, HTML/JSON-LD escaping, structured-data scope, crawler policy and hosting fallback status. The full build also validates rendered page content and canonical counts, and rejects missing/non-indexable catalogue details during an indexable build.

Primary implementation references: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google's AI-search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [OpenAI crawler controls](https://developers.openai.com/api/docs/bots), and [Playwright browser setup](https://playwright.dev/docs/browsers). Google emphasizes standard SEO for its AI search features and does not require `llms.txt`; OpenAI documents separate controls for search discovery and model training.


## Backend scaling: first phase

The API now supports optional Redis for shared rate limits, shared AI daily usage limits, and public catalogue caching. Kafka and background job workers are not part of this phase.

### Redis setup

From Backend, start the development Redis service with Docker Compose:

~~~sh
docker compose -f compose.redis.yml up -d
~~~

Set these backend environment variables and restart the API:

~~~dotenv
REDIS_URL=redis://127.0.0.1:6379
REDIS_PREFIX=misty:
MONGO_POOL_SIZE=20
~~~

Use a private, authenticated Redis service in production, with a rediss:// URL for TLS where supported. All instances of the same environment must share the Redis endpoint and prefix; staging must use a different prefix. The local Compose service binds only to localhost. Its noeviction policy protects rate-limit and quota counters from eviction; monitor memory and availability. Redis persistence and failover settings determine how counters survive restarts.

Without REDIS_URL, development continues with process-local rate limits and no shared HTTP cache. With Redis configured, rate-limit storage failures reject requests rather than silently bypassing limits. The shared AI budget counts attempted provider calls by UTC date, including provider failures; local concurrency remains capped at four provider calls per process. A Redis outage disables provider generation. Cached AI conversations are not stored in Redis.

Anonymous GET /api/admin/cities, /api/tours and public tour detail responses are cached for 30 seconds, with a 512 KB response cap. Requests carrying Authorization or Cookie headers bypass this cache. Successful admin, agency, tour and payment mutations rotate a shared cache generation before returning; in-flight older reads cannot repopulate the new generation. Cache errors fall back to database reads, although the global Redis-backed limiter still requires Redis availability. External database edits and failed invalidations can leave cached catalogue data visible until its TTL expires. Booking decisions always read MongoDB, never the display cache.

### Database and booking consistency

- **MongoDB replica set required:** tour reservations, hotel booking creation/referral-credit debits, tour payment rejection/seat release, and payout balance checks now use transactions. MongoDB Atlas supports replica sets; a standalone local mongod must be configured as a replica set before using these paths. There is no unsafe nontransactional fallback.
- Concurrent tour requests cannot commit more seats than a departure holds. Creating the booking and reserving its seats commit together, and failed booking writes roll back the reservation.
- Seat quantities must be positive whole numbers. Closed/past departures cannot be booked. Agency edits preserve server-owned seat counters and reject removal, rescheduling or reduced capacity for reserved departures. Optimistic concurrency rejects stale package edits.
- Manual payment verification and gateway settlement compete on the pending state, so only one succeeds. Duplicate verification, conflicting transitions and repeated seat-release attempts return a conflict. Paid hotel cancellations go through support instead of silently changing financial state.
- Escrow release and payout approval use conditional database updates. Concurrent payout requests serialize per recipient before checking and reserving their available balance. Referral credits and their resulting hotel booking commit together. Booking references use UUIDs.
- Hotel listings do not yet model room-by-room inventory: these changes do not introduce guaranteed room availability. Booking-create retries also need client idempotency keys before they can be treated as exactly-once submissions; payment settlement guards are separate.

Connection pools default to 20 connections per API instance (configurable up to 100), with bounded server selection and pool wait times. Size the total across every instance to your database connection allowance. The API starts listening after MongoDB connects. GET /health/ready returns 200 only when MongoDB and configured Redis are ready; otherwise it returns 503. SIGTERM/SIGINT drain HTTP connections with a ten-second shutdown deadline.

Production disables automatic index creation. During deployment, run the additive index command from Backend:

~~~sh
npm run db:indexes
~~~

It creates all declared model indexes, including the new booking, tour, payout and trip-request indexes, without dropping existing indexes. Schedule this against production according to your database maintenance policy. Partner balances now use MongoDB aggregation instead of loading every financial record into Node memory. City reads select only public display fields and use lean objects. Public tours accept page and limit (default 200, maximum 200); the existing tours array remains, alongside pagination metadata. Search is performed before pagination with escaped literal matching and a five-second query timeout. Agency approval filtering can make a page shorter than its limit. Existing UIs still show their initial page; broad UI pagination and the remaining admin report queries are later work.

If deploying behind a reverse proxy, set TRUST_PROXY_HOPS only to the exact trusted hop count and prevent direct public access that could bypass that topology. Do not enable blanket trust of forwarded IP headers.

### Verification and remaining scaling work

~~~sh
cd Backend
npm test
npm run test:integration
~~~

The fast suite covers cache isolation/invalidation/failure handling, pagination validation and existing AI/payment flows. The integration suite starts a disposable MongoDB replica set to test competing bookings, rollback, payment transitions, referral credits and payouts. Its first run downloads a MongoDB binary and can take several minutes. Set REDIS_TEST_URL to a disposable Redis service to run the two-instance limiter and shared-budget integration test; otherwise that test is explicitly skipped. Redis test keys use a unique prefix and are removed afterwards. Tests never use the application's MongoDB database.

The next phase below adds Socket.IO adapter/presence coordination and hardens existing Cloudinary uploads. Connect and test those shared services before adding production replicas; migrate any legacy local upload URLs first. BullMQ email/notification workers, durable notification retries, wider report pagination and deployment-specific load testing remain future phases. This implementation does not establish a guaranteed concurrent-user capacity. Measure latency, throughput and errors on your actual deployment before setting capacity targets.

References: [Redis Node client](https://redis.io/docs/latest/develop/clients/nodejs/connect/), [Redis rate-limit store](https://github.com/express-rate-limit/rate-limit-redis), [Mongoose transactions](https://mongoosejs.com/docs/8.x/docs/transactions.html).


## Ask Misty: strict context guardrails

Ask Misty is restricted to Pakistani tourism catalogue discovery and reviewed Misty Mounts help (planning, booking steps, payment/refund steps, weather-data limitations and safety-resource links). It is not a general-purpose chatbot and does not access personal bookings, execute actions, browse the web, or provide current route assurances.

The backend now uses Gemini only to classify the question and select opaque catalogue IDs. User-visible answer text comes from fixed, reviewed English/Urdu responses; generated prose is never returned. Recommendations link only to validated entries in the server-provided catalogue. This deliberately trades unrestricted conversational answers for a much tighter content boundary.

- Explicit instruction overrides, secret extraction and recognised unrelated/mixed-topic requests receive a fixed refusal before a provider call.
- The classifier is instructed to reject unrelated tasks and mixed requests, including overseas travel, general coding/homework and professional advice. Unknown or unsupported facts get an insufficient-context response.
- Caller-supplied assistant turns are discarded. System/tool roles, oversized histories, blank messages and requests without a final user question are rejected with HTTP 400. Only the last five user questions are used for context.
- Supplier descriptions and generated URLs are excluded from chat context/output. Suspicious display labels are filtered, source URLs are constructed by the server, and selected IDs must exist and match the selected category.
- Invalid model output, unknown IDs, extra generated fields and provider failures cannot become a free-form answer. Limited fixed help or matching catalogue links remain available; otherwise the bot says it lacks information.
- Weather and safety replies do not invent forecasts, temperatures, travel times or road-opening status. Booking and payment replies explain steps without claiming a transaction occurred.
- Chat responses use Cache-Control: no-store, and the existing request limits and AI quota remain in force.

Topic classification can still misunderstand ambiguous wording, so it is not a claim of perfect intent detection. The enforced output boundary is narrower: only reviewed reply text and selected public catalogue labels/links can reach the visitor. Other AI endpoints retain their separate validation; this strict response mechanism applies to POST /api/ai/chat.

Run node --test tests/chatGuard.test.js tests/aiRoutes.test.js from Backend for adversarial and HTTP regression checks. Cases include prompt overrides, forged history, catalogue injection, invented source IDs, unrelated questions, Urdu refusals and provider outages.


## Backend scaling: realtime and shared uploads

Socket.IO now uses a Redis adapter whenever REDIS_URL is configured, so authenticated user rooms, messages, read receipts and authorized typing events can reach sockets on other API instances. Without Redis, the same code operates on one process.

Presence uses adapter-backed socket enumeration rather than per-process online counters. A user remains online while a tab is connected on any instance. Each instance refreshes its clients' snapshot every 15 seconds and shortly after local connect/disconnect events. Abrupt instance loss therefore clears stale presence on subsequent successful snapshots. Failed presence reads emit an unavailable event and the frontend clears stale badges. Presence is eventually consistent and currently sends the authenticated online-user ID list; a much larger deployment should scope presence to visible contacts instead of increasing the global list indefinitely.

Socket authentication requires a valid signed JWT, a valid user ID and an expiry. Expired connections are disconnected within the one-second expiry check interval. Typing events validate the recipient's traveller/guide role pairing, validate payloads, and are throttled per socket. Incoming socket payloads are capped at 16 KB. Client presence refresh requests are throttled and shared enumeration requests are coalesced. Redis transport errors are handled without allowing fire-and-forget adapter promises to crash the API.

### Shared upload storage

Both image and avatar uploads already used Cloudinary; no replacement storage provider is needed. This phase adds configuration checks before buffering, a shared per-user upload rate limit, bounded active upload requests per instance, and a 20-second provider timeout. Missing credentials return 503 rather than writing to a local disk. All replicas must use the same Cloudinary account.

- Supported formats: JPEG, PNG, WebP and GIF. SVG and mismatched MIME/file signatures are rejected. Signature checks are preliminary; Cloudinary performs the actual image decoding.
- Maximum image size: 5 MB; avatar size: 2 MB. One file per request, with no extra multipart fields. Folder selection remains allowlisted.
- Upload rate: 30 requests per user per 15 minutes, shared through Redis when configured.
- UPLOAD_CONCURRENCY defaults to 8 per instance (maximum 32). Busy requests return 503 with Retry-After. Accepted uploads hold their slot through provider completion even if the browser disconnects.
- Provider credentials and raw provider errors are never returned to the browser. Multer is upgraded to version 2.

The legacy /uploads static route is still present for existing links. It is not shared storage: move any referenced historical files to shared storage and update their URLs before deploying replicas. The new upload paths never write there.

### Run behind a load balancer

Configure the same values on each backend instance:

~~~dotenv
MULTI_INSTANCE=true
REDIS_URL=redis://your-private-redis:6379
REDIS_PREFIX=misty-production:
MONGO_URI=your-replica-set-connection
JWT_SECRET=your-shared-secret
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
UPLOAD_CONCURRENCY=8
~~~

Set a different PORT for each local instance, or use separate containers. MULTI_INSTANCE=true refuses startup when Redis or Cloudinary configuration is missing. The Redis adapter must connect and subscribe before the API listens. Readiness includes MongoDB, Redis and realtime transport state and becomes false during shutdown. Readiness checks configuration/connectivity, not Cloudinary credential validity; verify an upload in staging.

Backend/deploy/nginx.conf.example shows two local backends and WebSocket forwarding; it is a template, not a deployed proxy or TLS setup. The frontend currently requests WebSocket-only transport. If HTTP polling is enabled later, configure sticky sessions as required by Socket.IO. Keep backend ports private, set TRUST_PROXY_HOPS to your actual proxy topology, and point VITE_API_URL/VITE_SOCKET_URL at the public load-balancer origin. Keep Redis on a trusted private network with appropriate authentication/TLS and an isolated environment prefix.

Redis Pub/Sub is a live delivery channel, not a durable message queue. Messages continue to be stored in MongoDB by the REST controller; clients must reload history after missed live events. A Redis outage removes an instance from readiness and may interrupt delivery. This phase does not add an exactly-once event guarantee, background job workers, or a new user-capacity claim.

### Tests

npm test includes real local WebSocket tests for authentication, multi-tab presence, private-room delivery, typing and expiry, plus upload input/configuration checks. No live Cloudinary upload is performed by these tests.

With REDIS_TEST_URL set to an isolated test Redis service, npm run test:integration also checks room delivery and presence across two separate Socket.IO servers. That test is skipped explicitly when Redis is unavailable. Run it against your actual Redis setup before deploying replicas. Deploy-time load tests, durable email/notification jobs and broader report pagination remain subsequent work.

References: [Socket.IO Redis adapter](https://socket.io/docs/v4/redis-adapter/) and [Cloudinary Node uploads](https://cloudinary.com/documentation/node_image_and_video_upload).
## Durable background delivery

Contact reply emails and browser push notifications can now run in a separate worker. Set `BACKGROUND_JOBS_ENABLED=true` in the API and worker environments, run `npm run db:indexes` from `Backend`, then deploy `npm run worker` alongside the API under a process supervisor. Use the same MongoDB database and SMTP/VAPID configuration. MongoDB must support transactions (a replica set or Atlas). This option defaults to false; existing synchronous contact emails and best-effort push remain available without a worker. OTP emails always send immediately with bounded SMTP connection/socket timeouts.

The MongoDB delivery collection acts as a durable queue. Creating a contact reply or notification and its delivery jobs is transactional. Each worker processes one job at a time; additional worker processes claim jobs atomically. Jobs retry up to five attempts with exponential backoff starting at 30 seconds. A two-minute renewable lease recovers work after a process dies. Ownership tokens prevent stale workers from acknowledging another worker's claim. Push delivery is tracked per subscription, so successful devices are not retried when another device fails. Dead push endpoints are removed.

The admin Queries page displays queued, sent, and failed email states and refreshes the current page every ten seconds. “Sent” means accepted by the mail transport, not confirmed inbox delivery. Run `npm run jobs:status` to inspect counts, oldest creation times, and expired leases without printing message contents. Monitor growing queues and failed jobs; after fixing provider settings, an administrator can submit a new reply for a terminal failure. Successful jobs now expire after the configured retention period; failed and pending jobs remain available. Stop workers gracefully with SIGTERM/SIGINT; they finish their current job before disconnecting.

Delivery is at least once: a crash after a provider accepts a message but before acknowledgement can cause a duplicate. Stable email Message-IDs help identification but do not guarantee deduplication. Repeated admin submissions are separate replies. Notification creation in existing booking controllers remains best-effort and is not part of the booking transaction. Deleting a contact query/notification cancels jobs not yet loaded by a worker; an in-flight send may still finish. Do not disable the worker until queued jobs have drained. API readiness alone does not prove a worker is running; supervise it and monitor `jobs:status`.

Validation uses a disposable MongoDB replica set and simulated delivery transports: concurrent claims, delayed retries, retry exhaustion, crash recovery, and ownership fencing. No real emails or pushes are sent by these tests. Redis remains useful for shared API limits, cache, and sockets; this delivery phase adds no Kafka or BullMQ dependency.

## Security and database efficiency - September 2026

See [the current audit](SECURITY_REVIEW_2026-09-28.md) for findings, test evidence, and remaining work. A critical OTP authentication bypass was fixed, along with OTP replay/counter races, OTP logging, unsafe push endpoints and cross-account subscription changes. JWT claims, signup/profile/review inputs, and email ownership checks are stricter. Email changes require a future verified change-email flow and are unavailable in profile settings. Live notifications no longer persist private message bodies in shared browser storage.

Both dependency trees were updated. Local semantic search uses `@huggingface/transformers` with WASM/q8 inference; it remains lazy-loaded and was checked with real browser embeddings. Restart Vite after installing dependencies so stale optimized modules are rebuilt.

| List | API pagination | Client behavior |
| --- | --- | --- |
| Admin contact queries | `page`, `limit`, `filter=all/unread`; default 20 | Server page controls and global total/unread counts |
| Chat history | `before` ObjectId, `limit`; default 50 | Newest messages first fetched, chronological display, load older |
| Notifications | `page`, `limit`; default 50 | Load older notifications |
| General/location/guide reviews | `page`, `limit`; default 20; `kind=general` for general feed | Load more reviews, full matching-review summary statistics |
| Partner payout / guide earnings history | `page`, `limit`; default 20 | Server page controls; full balance remains independent of page |

Lists cap `limit` at 200 and reject malformed parameters. New indexes match owner/filter/sort queries; reads use lean documents and five-second query deadlines. An integration explain check verifies an unread-query index scan. These changes reduce transferred documents and avoid hydrating entire histories; production speed and capacity must still be measured. Admin-wide financial reports and some catalogue/provider lists still need coordinated pagination and summary migration; see the audit's remaining-work section.

From `Backend`, deploy the indexes and retention policy:

```sh
npm run db:indexes
# Optional one-time backfill for successful jobs completed before this release:
npm run jobs:retention
```

Set `DELIVERY_RETENTION_DAYS=30` (integer 1-365). New successful jobs receive an expiry timestamp; MongoDB's partial TTL index deletes only `sent` jobs. The backfill schedules older successful jobs from their completion date, so jobs past retention become eligible for deletion. Failed/pending jobs and original contact/payment records remain intact. Changing the setting affects newly completed jobs; it does not rewrite existing dates. TTL removal is asynchronous, as described in [MongoDB's TTL documentation](https://www.mongodb.com/docs/manual/core/index-ttl/).

Deploy the frontend and API together, and rotate `JWT_SECRET` across API instances to invalidate tokens potentially issued through the fixed bypass. All users will need to sign in again; outstanding pre-upgrade OTPs must be requested again. Production startup requires a secret of at least 32 bytes. No live database migration or secret rotation was performed during local development.
