<div align="center">

# ⛰️ Misty Mounts

### A cinematic, full‑stack tourist‑guide platform for Northern Pakistan

Discover the valleys of Gilgit‑Baltistan — browse spots, book stays, chat with real local guides in real time, and stay safe with live weather & disaster alerts.

<br/>

![Stack](https://img.shields.io/badge/stack-MERN-1f9d55?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-38bdf8?style=for-the-badge&logo=react&logoColor=white)
![Node](https://img.shields.io/badge/Node-Express-3c873a?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-13aa52?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-a3e635?style=for-the-badge)

</div>

---

## ✨ Overview

**Misty Mounts** is a three‑role MERN application:

| Role | What they do |
| :--- | :--- |
| 🧭 **Traveller** | Browse destinations, save spots, book stays, leave reviews, and chat with a local guide. |
| 🏔️ **Local Guide** | Curate tourist spots, post safety alerts, and answer travellers in real time. |
| 🛡️ **Admin** | Manage spots, accommodations, transport, and bookings across the platform. |

The frontend is an immersive, dark **“night + lime”** bento UI (React + Vite + Tailwind + Framer Motion). It runs against the live API when configured, and **gracefully falls back to a built‑in dummy‑data layer** when it isn't — so you can demo the whole UI with zero backend.

---

## 🚀 Features

<table>
<tr><td width="33%" valign="top">

### 🧭 Traveller
- Destination discovery with advanced filters
- Spot detail (weather · map · activities)
- Hotel & food booking with PKR pricing
- **Saved spots** ❤️ (server‑synced)
- **My bookings** history + cancel
- **Notifications** centre + bell
- **Profile** + avatar upload
- Reviews & ratings
- Real‑time **guide chat**

</td><td width="33%" valign="top">

### 🏔️ Local Guide
- Tourist‑spot CRUD (with photo upload)
- Natural‑disaster **safety alerts**
- Real‑time inbox — reply to travellers
- Reviews dashboard
- Dashboard analytics

</td><td width="33%" valign="top">

### 🛡️ Admin
- Spots / accommodations / transport CRUD
- Booking & payment management
- Revenue & content analytics
- Secure username/password login

</td></tr>
</table>

**Platform‑wide:** unified JWT auth · email **OTP verification** (Brevo) · **Cloudinary** image uploads · persisted Socket.io chat · role‑based route protection · server‑side validation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18 · Vite 6 · Tailwind CSS 3 · Framer Motion · React Router 7 · Axios · Socket.io‑client · Leaflet |
| **Backend** | Node.js · Express 4 · MongoDB (Atlas) · Mongoose 8 · Socket.io 4 · JWT · bcryptjs |
| **Integrations** | ☁️ Cloudinary (images) · ✉️ Brevo SMTP (OTP email via Nodemailer) |

---

## 🗂️ Project Structure

```
Misty-Mounts-Tourist-Guide/
├─ Backend/
│  ├─ AdminBackend/         # admin auth + spots/accommodations/transport/places
│  ├─ LocalGuidePannel/     # user & guide auth (OTP), tourist spots, disasters
│  ├─ UserBackend/          # profile, saved, bookings, notifications, reviews, chat
│  ├─ config/               # db.js, cloudinary.js
│  ├─ middleware/           # auth.js (authenticate / requireRole)
│  ├─ routes/               # uploadRoutes.js (Cloudinary)
│  ├─ utils/                # mailer.js (Brevo OTP email)
│  ├─ seed.js               # populate MongoDB from the frontend demo content
│  └─ server.js             # Express + Socket.io entry
└─ Frontend/
   └─ src/
      ├─ UserPanel/         # traveller-facing pages & components (night/lime bento)
      ├─ AdminFrontend/     # admin dashboard (emerald)
      ├─ LocalGuidePannel/  # guide dashboard (emerald)
      ├─ components/        # shared (dashboard kit, NotificationSystem, ...)
      ├─ context/           # AuthContext (auth + socket)
      ├─ data/              # api.js, mockApi.js, adminApi.js, mockData.js
      └─ utils/             # validation, currency, stores (saved/bookings/notifications)
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** ≥ 18 and npm
- A **MongoDB** connection string (Atlas or local)
- *(optional for full features)* **Cloudinary** account + **Brevo** SMTP credentials

### 1 · Clone
```bash
git clone <your-repo-url>
cd Misty-Mounts-Tourist-Guide
```

### 2 · Configure environment
Copy the example files and fill in your values:
```bash
cp Backend/.env.example  Backend/.env
cp Frontend/.env.example Frontend/.env
```

### 3 · Backend — install, seed, run
```bash
cd Backend
npm install
npm run seed     # populates MongoDB with demo spots, stays, reviews, admin & test users
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
| `PORT` | API port *(optional, default `5000`)* |
| `CLIENT_URL` | Allowed CORS/socket origin *(optional, default `http://localhost:5173`)* |
| `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` | Cloudinary image uploads |
| `EMAIL_HOST` · `EMAIL_PORT` · `EMAIL_SECURE` · `EMAIL_USER` · `EMAIL_PASS` · `BREVO_SENDER_EMAIL` | Brevo SMTP (OTP email) |

**`Frontend/.env`**

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | API base, e.g. `http://localhost:5000/api` *(unset → dummy‑data mode)* |
| `VITE_SOCKET_URL` | Socket.io URL, e.g. `http://localhost:5000` |

> ⚠️ **Never commit real `.env` files.** They're git‑ignored; commit only the `.env.example` templates.

---

## 👤 Demo Accounts (after `npm run seed`)

| Role | Email / Username | Password |
| :--- | :--- | :--- |
| Traveller | `test@example.com` | `password123` |
| Local Guide | `guide@example.com` | `password123` |
| Admin | `saymi313` | `usairam1234` |

New sign‑ups go through **email OTP verification** — a 6‑digit code is emailed via Brevo (with a graceful `dev OTP:` console fallback if SMTP is unavailable).

---

## 🔑 Authentication & OTP Flow

```
Sign up ──▶ 6-digit OTP emailed (Brevo) ──▶ Verify code ──▶ JWT issued ──▶ Signed in
Log in  ──▶ if unverified: OTP re-sent ──▶ Verify ──▶ Signed in
```

- One `JWT_SECRET` and a shared `{ id, type }` payload for **admin / user / guide**.
- `authenticate` + `requireRole(...)` middleware guard every write route.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

<details>
<summary><b>Auth</b></summary>

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/user/auth/signup` | Register + send OTP |
| `POST` | `/user/auth/verify-otp` | Verify OTP → JWT |
| `POST` | `/user/auth/resend-otp` | Resend OTP |
| `POST` | `/user/auth/login` | Login (blocks unverified) |
| `POST` | `/admin/auth/login` | Admin login (username) |
</details>

<details>
<summary><b>Traveller (auth required)</b></summary>

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET/PUT` | `/user/me` | Get / update profile |
| `POST` | `/user/avatar` | Upload avatar → Cloudinary |
| `GET/POST/DELETE` | `/user/saved[/:spotId]` | Saved spots |
| `POST` | `/payment/create` | Create a booking |
| `GET` | `/payment/me` | My bookings |
| `PATCH` | `/payment/:id/cancel` | Cancel a booking |
| `GET/PATCH/DELETE` | `/notifications*` | List / mark‑read / delete |
| `POST` | `/upload` | Generic image upload → Cloudinary |
</details>

<details>
<summary><b>Content (public reads · staff writes)</b></summary>

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/admin/cities` · `/admin/spots[/:city]` · `/admin/places` | Tourist spots |
| `GET` | `/admin/accommodations[/:id]` | Stays & food |
| `GET` | `/admin/transportation[/:spotId]` | Transport |
| `GET` | `/feedback[/:locationName]` | Reviews |
| `POST` | `/feedback/submit` | Submit a review |
| `GET` | `/natural-disaster/get-disaster` | Safety alerts |
| `POST/PUT/DELETE` | `/admin/{places,accommodations,transportation}` · `/natural-disaster` | CRUD (admin/guide) |
</details>

<details>
<summary><b>Realtime (Socket.io)</b></summary>

Client emits `join-chat`, `user-message`, `agent-message`, `get-message-history`, `typing`.
Server emits `active-users`, `system-message`, `agent-message`, `user-message`, `message-history`, `new-message-notification`, `user-disconnected`. Messages persist to MongoDB.
</details>

---

## 📜 Scripts

**Backend**

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start with nodemon |
| `npm start` | Start the server |
| `npm run seed` | Seed MongoDB with demo content + accounts |

**Frontend**

| Command | Description |
| :--- | :--- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |

---

## 🛡️ Security

- Passwords & OTPs hashed with **bcryptjs**; JWTs signed with a single secret.
- Every write route is **auth‑ + role‑gated**; reads are public where appropriate.
- Server‑side validation on all forms; CORS locked to `CLIENT_URL`.
- Secrets live only in `.env` (git‑ignored) — rotate them if ever exposed.

---

## 🗺️ Roadmap

- [ ] OpenWeatherMap / Wikipedia enrichment on spot detail
- [ ] Real payment gateway (Stripe / Razorpay)
- [ ] Real Northern‑Pakistan photography (replacing placeholders)
- [ ] Push notifications & email digests

---

## 📄 License

Released under the **MIT License**.

<div align="center">

<br/>

**Made for the mountains of Gilgit‑Baltistan** ⛰️

</div>
