# RaktSetu — रक्त सेतु

An emergency blood donor network that matches urgent blood requests to nearby compatible donors in real time — built with React and Node.js.

Live demo: [https://raktsetu-phi.vercel.app](https://raktsetu-phi.vercel.app)

## Features

- **Emergency requests** — raise a blood request with hospital location, blood type, and urgency level
- **Compatibility matching** — applies the full 8-type ABO/Rh donor-recipient matrix to find every medically eligible donor type
- **Geo-matching** — finds available, compatible donors within a set radius using MongoDB geospatial queries, sorted nearest-first
- **Automated alerts** — emails matched donors an accept/decline link the moment a request is raised
- **Donor dashboard** — toggle availability, update your location, and view your notification history
- **Auth** — JWT-based signup/login for donor accounts

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose) with 2dsphere geospatial indexing
- **Email:** Resend API
- **Hosting:** Vercel (frontend) and Render (backend)

## Project Structure

```
raktsetu/
├── backend/
│   ├── models/       # Donor, BloodRequest (2dsphere geo index)
│   ├── routes/       # auth, donors, requests (geo-matching logic)
│   ├── middleware/   # JWT auth guard
│   ├── utils/        # compatibility.js (matrix), mailer.js (Resend)
│   └── server.js
└── frontend/
    ├── src/pages/       # Home, Register, Login, Dashboard, CreateRequest, RequestDetail
    ├── src/components/  # Navbar, Footer, CompatibilityGrid, PulseLine
    └── src/context/     # AuthContext (JWT session)
```

## Running Locally

1. Clone this repository

```
git clone https://github.com/himanshugoud/raktsetu.git
```

2. Set up the backend

```
cd raktsetu/backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, RESEND_API_KEY
npm run dev
```

3. Set up the frontend

```
cd raktsetu/frontend
npm install
cp .env.example .env   # set VITE_API_URL to <backend-url>/api
npm run dev
```

Visit `http://localhost:5173`.

> Note: live features (donor alert emails) require a Resend API key. On Resend's free tier, without a verified domain, emails only deliver to the address you signed up with — verify a domain at [resend.com/domains](https://resend.com/domains) to email real donors.

## Author

Himanshu Goud
