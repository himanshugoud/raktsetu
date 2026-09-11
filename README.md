# RaktSetu — रक्त सेतु

**An emergency blood donor network that finds compatible, nearby donors the moment a request comes in — and gets the requester calling them within seconds, not waiting on email.**

🔴 **Live demo:** [raktsetu-phi.vercel.app](https://raktsetu-phi.vercel.app) — try it instantly with the **"Use a demo location instead"** link on the request form, no GPS or account setup required.

[![Backend Tests](https://github.com/himanshugoud/raktsetu/actions/workflows/tests.yml/badge.svg)](https://github.com/himanshugoud/raktsetu/actions/workflows/tests.yml)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue)](#tech-stack)
[![Backend](https://img.shields.io/badge/backend-Node%20%2B%20Express-blue)](#tech-stack)

---

## Screenshots

**Homepage**
![Homepage](docs/screenshots/home.png)

**Request flow — matched donors, callable instantly**
![Request flow with matched donors](docs/screenshots/request-flow.png)

**Donor dashboard**
![Donor dashboard](docs/screenshots/dashboard.png)

## Why this exists

Blood requests are time-critical, but most donor networks rely entirely on email — which is slow, easy to miss, and useless in an actual emergency. RaktSetu's core design decision is that **the requester should never be stuck waiting**: the moment a request is raised, they see a ranked, callable list of matched donors on-screen, while emails and real-time browser push notifications go out to matched donors in parallel as backup channels.

## Engineering highlights

A few decisions that go beyond a typical CRUD donor app:

- **Real medical constraint modeled in the matching logic** — donors who donated within the last 90 days are automatically excluded from matching (the standard whole-blood donation gap), with a clear "Resting until [date]" status shown on their own dashboard.
- **Auto-widening search radius** — if no donors are found at 10km, the backend automatically retries at 25km → 50km → 100km before giving up, so a request in a low-donor-density area doesn't just dead-end.
- **Full ABO/Rh compatibility matrix**, not a simplified lookup — covers all 8 blood types and their correct multi-directional compatibility rules.
- **17 passing automated tests** (Vitest) covering the compatibility matrix and the geo-distance/radius-escalation logic, with that logic refactored into a pure, dependency-free module (`backend/utils/geo.js`) specifically so it's unit-testable.
- **Designed around a real free-tier constraint, not around it**: Render's free backend cold-starts after inactivity, so the frontend shows a "waking up the server" banner instead of looking broken during the ~30-60s first request.
- **Live status without polling the user's patience** — a requester's own request page checks for updates every ~10 seconds and surfaces a banner the instant a donor accepts, no manual refresh needed.
- **Real-time browser push notifications** — donors get an OS-level push alert the moment they're matched to a request, using the Web Push API with VAPID authentication, so alerts reach every donor rather than only the project owner's inbox (a limitation of the free email tier).
- **Bilingual from the ground up** — full Hindi/English UI toggle covering every page and error message, including handling a Devanagari line-height rendering bug that only shows up with certain conjunct characters.
- **Human-readable donor locations** — reverse geocoding turns raw coordinates into locality names (e.g. "near Indrapuri Colony") shown on match results, rather than showing users a raw lat/long.

## Features

**Requester side**
- Raise an emergency request with blood type, hospital, urgency, and location
- Immediately see a ranked, callable list of matched donors — sorted nearest-first, with each donor's past donation count shown as a trust signal
- Live status updates as donors respond, without refreshing
- A demo-location option so anyone can try the full flow without granting real GPS access

**Donor side**
- Register with blood type + location; update location anytime from the dashboard
- Accept/decline emergency alerts by email, browser push notification, or from the dashboard
- Enable real-time push alerts with a single click — no app install needed
- See your own 90-day donation cooldown status clearly explained
- Forgot/reset password flow with hashed, time-limited reset tokens

**Platform**
- Geo-matching via MongoDB `2dsphere` indexes, with automatic radius escalation
- Full ABO/Rh compatibility matrix (all 8 blood types)
- JWT-based auth for donor accounts
- Rate limiting (`express-rate-limit`) on auth and on raising new requests, as basic anti-spam protection
- Rich social share previews (Open Graph/Twitter cards with a custom preview image) so sharing the link on WhatsApp/LinkedIn looks intentional, not broken
- SPA routing that survives a hard refresh on Vercel
- Full Hindi/English language toggle across the entire app
- Live homepage donor count pulled from a real `/api/stats` endpoint (not a fabricated number)

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose) with 2dsphere geospatial indexing
- **Email:** Resend API
- **Push Notifications:** Web Push API (`web-push` npm package) with VAPID authentication, backed by a service worker
- **Geocoding:** OpenStreetMap Nominatim (reverse geocoding for donor locality names)
- **Testing:** Vitest (17 tests, backend logic)
- **CI:** GitHub Actions — backend test suite runs on every push
- **Hosting:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Project Structure

```
raktsetu/
├── backend/
│   ├── models/       # Donor (incl. pushSubscriptions), BloodRequest (2dsphere geo index)
│   ├── routes/       # auth, donors (incl. push subscribe/unsubscribe), requests (geo-matching + radius escalation)
│   ├── middleware/   # JWT auth guard
│   ├── utils/        # compatibility.js (ABO/Rh matrix), geo.js (distance + radius logic),
│   │                 # mailer.js (Resend), push.js (Web Push sender), geocode.js (reverse geocoding)
│   ├── scripts/      # seedDemoDonors.js, generateVapidKeys.js
│   └── server.js
└── frontend/
    ├── public/sw.js       # Service worker — handles push + notification click events
    ├── src/pages/         # Home, Register, Login, Dashboard, CreateRequest, RequestDetail,
    │                       # ForgotPassword, ResetPassword
    ├── src/components/    # Navbar, Footer, CompatibilityGrid, PulseLine, SlowServerBanner
    ├── src/context/       # AuthContext (JWT session), LanguageContext (Hindi/English)
    ├── src/i18n/          # strings.js — 150+ translation keys
    └── src/utils/push.js  # Client-side push subscribe/unsubscribe helpers
```

## Testing

```
cd raktsetu/backend
npm test
```

17 tests covering the blood-type compatibility matrix (all 8 types, both directions) and the geo-distance/radius-escalation logic, run both locally and against the deployed build via GitHub Actions on every push.

## Try the donor side too

The demo-location trick above shows the requester experience. To see the donor side — the dashboard, the "Helped X times before" reliability count, push notification opt-in, and the 90-day eligibility cooldown — log in with any of these seeded demo accounts:

- **Email:** `demo.donor1@example.com` (through `demo.donor10@example.com`)
- **Password:** `Demo@1234`

These are fake accounts seeded specifically for demo purposes (see `backend/scripts/seedDemoDonors.js`) — no real donor data.

## Running Locally

1. Clone this repository

```
git clone https://github.com/himanshugoud/raktsetu.git
```

2. Set up the backend

```
cd raktsetu/backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, RESEND_API_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
npm run dev
```

Generate your own VAPID keys with:

```
node scripts/generateVapidKeys.js
```

3. Set up the frontend

```
cd raktsetu/frontend
npm install
cp .env.example .env   # set VITE_API_URL to <backend-url>/api and VITE_VAPID_PUBLIC_KEY to your public VAPID key
npm run dev
```

Visit `http://localhost:5173`.

> **Demo email limitation:** on Resend's free tier, without a verified domain, donor alert emails only deliver to the address you signed up with — not to arbitrary donor emails. This is why the requester-facing call list exists as the primary channel rather than a fallback, and why push notifications were added as a real-time channel that works for every donor. Verify a domain at [resend.com/domains](https://resend.com/domains) to send email to real donors.

> **Locality name limitation:** donor locality names (e.g. "near Indrapuri Colony") are generated via free reverse geocoding (OpenStreetMap/Nominatim), which has uneven coverage of small residential areas in India. It occasionally shows a nearby named place rather than the exact colony — a known tradeoff of using free, crowd-sourced map data instead of a paid geocoding API.

> **Deploying push notifications on Vercel:** if you add `VITE_VAPID_PUBLIC_KEY` as a Vercel environment variable, use the **"Config"** type, not "Secret". Vercel warns that any `VITE_`-prefixed variable gets exposed to the browser (which is expected — Vite bakes these into the client build), and "Secret" type doesn't reflect that. Since a VAPID *public* key is meant to be public, "Config" is the correct type and clears the warning. Remember to trigger a redeploy afterward — Vite only reads env vars at build time, so a running deployment won't pick up a newly added variable until it's rebuilt.

## Author

Himanshu Goud
