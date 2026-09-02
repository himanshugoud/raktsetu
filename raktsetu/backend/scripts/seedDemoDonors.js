// One-time (safe to re-run) script that seeds a handful of fake donor
// accounts around a fixed demo location, so anyone trying the live site —
// e.g. a recruiter, anywhere in the world — can see real donor matches
// without needing to be physically near real donors.
//
// Run locally with: node scripts/seedDemoDonors.js
// (uses the same MONGO_URI as your backend/.env — this writes to whichever
// database that points to, local or production Atlas.)

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Donor from "../models/Donor.js";

// Fixed demo center: India Gate, New Delhi. Chosen because it's a
// recognizable, neutral public landmark — not anyone's real address.
const DEMO_CENTER = { latitude: 28.6129, longitude: 77.2295 };
const DEMO_PASSWORD = "Demo@1234";

// name, blood type, distance from center (km) is baked into the
// pre-computed coordinates below — some inside the default 10km radius,
// two further out (15km, 20km) so the radius auto-widening feature has
// something to demonstrate too.
const DEMO_DONORS = [
  { name: "Priya Sharma",  bloodType: "O-",  lat: 28.63087, lon: 77.2295,  totalDonations: 3 },
  { name: "Rahul Verma",   bloodType: "O+",  lat: 28.6129,  lon: 77.2602,  totalDonations: 0 },
  { name: "Ananya Singh",  bloodType: "A+",  lat: 28.57697, lon: 77.2295,  totalDonations: 1 },
  { name: "Vikram Rao",    bloodType: "A-",  lat: 28.6129,  lon: 77.17834, totalDonations: 0 },
  { name: "Neha Gupta",    bloodType: "B+",  lat: 28.65101, lon: 77.27291, totalDonations: 5 },
  { name: "Arjun Mehta",   bloodType: "B-",  lat: 28.56844, lon: 77.28015, totalDonations: 0 },
  { name: "Kavya Nair",    bloodType: "AB+", lat: 28.66372, lon: 77.17161, totalDonations: 2 },
  { name: "Rohan Das",     bloodType: "AB-", lat: 28.55573, lon: 77.16438, totalDonations: 0 },
  { name: "Simran Kaur",   bloodType: "O+",  lat: 28.7456,  lon: 77.25615, totalDonations: 0 }, // ~15km out
  { name: "Aditya Joshi",  bloodType: "A+",  lat: 28.5817,  lon: 77.43105, totalDonations: 1 }, // ~20km out
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding demo donors...");

  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (let i = 0; i < DEMO_DONORS.length; i++) {
    const d = DEMO_DONORS[i];
    const email = `demo.donor${i + 1}@example.com`; // reserved non-deliverable domain (RFC 2606)
    const phone = `+91 90000 000${String(i + 1).padStart(2, "0")}`; // clearly fake, sequential

    await Donor.findOneAndUpdate(
      { email },
      {
        name: d.name,
        email,
        password: hashed,
        phone,
        bloodType: d.bloodType,
        city: "New Delhi (Demo)",
        location: { type: "Point", coordinates: [d.lon, d.lat] },
        available: true,
        totalDonations: d.totalDonations,
        lastDonationDate: null,
      },
      { upsert: true, new: true }
    );
    console.log(`Seeded: ${d.name} (${d.bloodType})`);
  }

  console.log("Done. Demo donors are live in the database.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});