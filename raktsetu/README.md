# RaktSetu — रक्त सेतु (Blood Bridge)

**[Live demo](https://raktsetu-phi.vercel.app)** · An emergency blood donor
network. Donors register their blood type and location; when someone raises
an urgent request, RaktSetu applies real ABO/Rh compatibility rules, finds
eligible donors within a radius using MongoDB geospatial queries, and emails
them — closest first.

## Architecture

raktsetu/
├── backend/ Node.js + Express + MongoDB (Mongoose) API
│ ├── models/ Donor, BloodRequest (with 2dsphere geo index)
│ ├── routes/ auth, donors, requests (geo-matching lives here)
│ ├── middleware/ JWT auth guard
│ ├── utils/ compatibility.js (matrix), mailer.js (Resend)
│ └── server.js
└── frontend/ React + Vite + Tailwind v4
├── src/pages/ Home, Register, Login, Dashboard, CreateRequest, RequestDetail
├── src/components/ Navbar, Footer, CompatibilityGrid, PulseLine (signature ECG element)
└── src/context/ AuthContext (JWT session)


## How the geo-matching works

1. A request stores its hospital location as a GeoJSON `Point`.
2. `compatibleDonorTypes(bloodType)` returns every blood type medically safe
   to donate to the patient (e.g. `AB+` patients can receive from all 8 types).
3. Mongo's `$near` on the donor collection's `2dsphere` index returns
   available, compatible donors within the radius (default 10 km),
   already sorted nearest-first.
4. Each matched donor is emailed via the Resend API — chosen over raw SMTP
   because several cloud hosts (including Render's free tier) block or
   time out outbound SMTP connections, while Resend sends over plain HTTPS.

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, RESEND_API_KEY
npm run dev
```

- **MONGO_URI**: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
- **RESEND_API_KEY**: create a free account and API key at [resend.com](https://resend.com).
  On the free tier, without a verified domain, emails can only be delivered
  to the address you signed up with — verify a domain at
  [resend.com/domains](https://resend.com/domains) to email real donors.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to <backend-url>/api
npm run dev
```

Visit `http://localhost:5173`.

## Deploying

- **Backend**: [Render](https://render.com) (free tier) — set the same env
  vars there, plus `CLIENT_URL` pointing at your deployed frontend.
- **Frontend**: [Vercel](https://vercel.com) — set `VITE_API_URL` to your
  deployed backend URL + `/api`. Includes a `vercel.json` rewrite rule so
  client-side routes (e.g. `/dashboard`) don't 404 on refresh.

## Resume-ready facts about this project

- Geo-matching system using MongoDB 2dsphere indexes to connect blood
  requests with compatible donors within a configurable radius, sorted by
  proximity.
- Blood-type compatibility logic implementing the full 8-type donor/
  recipient matrix, verified against real medical rules.
- Automated, distance-ranked email alerts to matched donors via the Resend
  API, with a fallback low-accuracy geolocation request on the client so
  location capture stays reliable indoors.
- Deployed as a decoupled frontend/backend: Vercel (React/Vite) talking to
  Render (Express/MongoDB Atlas) over a REST API secured with JWT auth.