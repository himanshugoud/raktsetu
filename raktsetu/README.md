# RaktSetu — रक्त सेतु (Blood Bridge)

An emergency blood donor network. Donors register their blood type and
location; when someone raises an urgent request, RaktSetu applies real
ABO/Rh compatibility rules, finds eligible donors within a radius using
MongoDB geospatial queries, and emails them — closest first.

## Architecture

```
raktsetu/
├── backend/          Node.js + Express + MongoDB (Mongoose) API
│   ├── models/        Donor, BloodRequest (with 2dsphere geo index)
│   ├── routes/         auth, donors, requests (geo-matching lives here)
│   ├── middleware/     JWT auth guard
│   ├── utils/           compatibility.js (matrix), mailer.js (Nodemailer)
│   └── server.js
└── frontend/          React + Vite + Tailwind v4
    ├── src/pages/       Home, Register, Login, Dashboard, CreateRequest, RequestDetail
    ├── src/components/  Navbar, Footer, CompatibilityGrid, PulseLine (signature ECG element)
    └── src/context/     AuthContext (JWT session)
```

## How the geo-matching works

1. A request stores its hospital location as a GeoJSON `Point`.
2. `compatibleDonorTypes(bloodType)` returns every blood type medically safe
   to donate to the patient (e.g. `AB+` patients can receive from all 8 types).
3. Mongo's `$near` on the donor collection's `2dsphere` index returns
   available, compatible donors within the radius (default 10 km),
   already sorted nearest-first.
4. Each matched donor is emailed via Nodemailer with an accept/decline link.

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD
npm run dev
```

- **MONGO_URI**: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
- **GMAIL_APP_PASSWORD**: generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
  (requires 2-Step Verification enabled on the Gmail account).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if backend isn't on localhost:5000
npm run dev
```

Visit `http://localhost:5173`.

## Deploying

- **Backend**: Render or Railway (free tier) — set the same env vars there.
- **Frontend**: Vercel — set `VITE_API_URL` to your deployed backend URL,
  and update `CLIENT_URL` in the backend's env to your deployed frontend URL.

## Resume-ready facts about this project

- Geo-matching system using MongoDB 2dsphere indexes to connect blood
  requests with compatible donors within a configurable radius, sorted by
  proximity.
- Blood-type compatibility logic implementing the full 8-type donor/
  recipient matrix, verified against real medical rules.
- Automated, distance-ranked email alerts to matched donors via Nodemailer.
