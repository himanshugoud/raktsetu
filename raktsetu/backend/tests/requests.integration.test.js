import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import Donor from "../models/Donor.js";

// Requests trigger real email + push sends. Mocked so tests never make
// outbound network calls to Resend or a push service — the sending logic
// itself isn't what this test suite is verifying.
vi.mock("../utils/mailer.js", () => ({
  sendUrgentAlert: vi.fn().mockResolvedValue(true),
  default: { sendUrgentAlert: vi.fn().mockResolvedValue(true) },
}));
vi.mock("../utils/push.js", () => ({
  sendPushToDonor: vi.fn().mockResolvedValue(undefined),
}));

// A fixed point near Bhopal, used as both the request's hospital location
// and the reference point donors are placed at various distances from.
const BASE_LAT = 23.2599;
const BASE_LON = 77.4126;

function signRequesterToken() {
  const fakeRequesterId = new mongoose.Types.ObjectId().toString();
  return jwt.sign({ id: fakeRequesterId }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

function makeDonor(overrides = {}) {
  return Donor.create({
    name: "Donor",
    email: `donor-${Math.random().toString(36).slice(2)}@example.com`,
    password: "hashed-not-used-here",
    phone: "9999999999",
    bloodType: "O+",
    city: "Bhopal",
    available: true,
    lastDonationDate: null,
    location: { type: "Point", coordinates: [BASE_LON, BASE_LAT] },
    ...overrides,
  });
}

function validRequestPayload(overrides = {}) {
  return {
    patientName: "Patient A",
    bloodType: "O+",
    hospitalName: "City Hospital",
    contactPhone: "8888888888",
    urgency: "urgent",
    latitude: BASE_LAT,
    longitude: BASE_LON,
    ...overrides,
  };
}

describe("POST /api/requests", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/api/requests").send(validRequestPayload());
    expect(res.status).toBe(401);
  });

  it("rejects a request missing required fields", async () => {
    const token = signRequesterToken();
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${token}`)
      .send({ bloodType: "O+" }); // missing patientName, hospitalName, contactPhone

    expect(res.status).toBe(400);
  });

  it("matches a nearby compatible donor and returns them in the response", async () => {
    // ~1km from the request location — well within the default 10km radius.
    await makeDonor({ location: { type: "Point", coordinates: [BASE_LON, BASE_LAT + 0.009] } });

    const token = signRequesterToken();
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${token}`)
      .send(validRequestPayload());

    expect(res.status).toBe(201);
    expect(res.body.matchedDonors).toHaveLength(1);
    expect(res.body.radiusUsedKm).toBe(10);
    expect(res.body.request.status).toBe("donors_notified");
  });

  it("excludes donors still in their 90-day donation cooldown", async () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    await makeDonor({
      location: { type: "Point", coordinates: [BASE_LON, BASE_LAT + 0.009] },
      lastDonationDate: tenDaysAgo,
    });

    const token = signRequesterToken();
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${token}`)
      .send(validRequestPayload());

    expect(res.status).toBe(201);
    expect(res.body.matchedDonors).toHaveLength(0);
    expect(res.body.request.status).toBe("pending");
  });

  it("excludes donors with an incompatible blood type", async () => {
    // A+ is not a compatible donor type for an O+ request.
    await makeDonor({
      bloodType: "A+",
      location: { type: "Point", coordinates: [BASE_LON, BASE_LAT + 0.009] },
    });

    const token = signRequesterToken();
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${token}`)
      .send(validRequestPayload());

    expect(res.status).toBe(201);
    expect(res.body.matchedDonors).toHaveLength(0);
  });

  it("widens the search radius when no donor is found nearby", async () => {
    // Roughly 30km north — outside the default 10km and the 25km step,
    // but within the 50km step, so radiusUsedKm should escalate to 50.
    await makeDonor({ location: { type: "Point", coordinates: [BASE_LON, BASE_LAT + 0.27] } });

    const token = signRequesterToken();
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${token}`)
      .send(validRequestPayload());

    expect(res.status).toBe(201);
    expect(res.body.matchedDonors).toHaveLength(1);
    expect(res.body.radiusUsedKm).toBe(50);
  });
});