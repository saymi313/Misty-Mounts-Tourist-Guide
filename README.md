<div align="center">

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

> **Built free‑first.** Every integration added for growth uses free, keyless services — no paid AI or weather APIs.

---

## 🚀 Features

### 🧭 Traveller
- Destination discovery with advanced filters, interactive **Leaflet map**
- Spot detail with **live 7‑day weather & "best time to visit"** (Open‑Meteo, free)
- **Group tours** — browse, detail, and book fixed departures with seat reservation
- Hotel & food **booking with escrow payment** (proof upload → admin verify) and PKR pricing
- **Trip Planner** — generates a day‑by‑day itinerary from real spots by your interests & pace
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
| `GEMINI_API_KEY` | *(optional)* Google Gemini **free-tier** key for the AI concierge & review summaries — get one free at aistudio.google.com. Without it, both fall back to a keyword responder. |
| `VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `VAPID_SUBJECT` | *(optional)* Web-Push keys — generate with `npx web-push generate-vapid-keys`. Without them, push is disabled (in-app notifications still work). |
| `PAYMENT_PROVIDER` · `PAYMENT_API_KEY` · `PAYMENT_WEBHOOK_SECRET` · `PAYMENT_CREATE_URL` · `PAYMENT_CHECKOUT_URL` | *(optional)* Online-payment gateway (e.g. Safepay/PayFast) sandbox credentials. Without them, checkout uses the manual proof-upload flow; with them, tours use hosted escrow checkout. |

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
| `POST` | `/translate` | Free EN→UR translation proxy (no key) |
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
- **Trip Planner** — `/plan` scores the real spot catalog against your interests & pace and builds a day‑by‑day itinerary that drops straight into the Trip Builder. Fully algorithmic — no external AI.
- **Translation** — `/api/translate` proxies free Google/MyMemory translation; the client walks the DOM and caches results in `localStorage`, flipping the site to RTL Nastaʿlīq for Urdu.

---

## 📜 Scripts

| Backend | Frontend |
| :--- | :--- |
| `npm run dev` — nodemon | `npm run dev` — Vite dev server |
| `npm start` — start server | `npm run build` — production build |
| `npm run seed` — seed demo content | `npm run preview` — preview build |

---

## 🛡️ Security

- Passwords & OTPs hashed with **bcryptjs**; JWTs signed with a single secret.
- Every write route is **auth‑ + role‑gated**; reads are public where appropriate.
- Server‑side validation on all forms; CORS locked to `CLIENT_URL`.
- Secrets live only in `.env` (git‑ignored) — **rotate any that were ever committed**.

---

## 🗺️ Roadmap

- [x] Live weather & "best time to visit" on spot detail
- [x] Safety toolkit — SOS, emergency contacts, live hazard alerts
- [x] Trip planner + shareable trip builder
- [x] Whole‑site English ⇄ Urdu translation
- [x] SEO (structured data, sitemap) + verified‑guide badges
- [x] AI concierge ("Ask Misty") — Gemini free tier + RAG, with fallback
- [x] Semantic "vibe" search — in‑browser embeddings (transformers.js), keyless
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
