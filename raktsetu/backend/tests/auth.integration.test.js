import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../app.js";

// Registration triggers a real reverse-geocoding HTTP call to OpenStreetMap.
// Mocked here so tests run fast, offline, and deterministically — the
// geocoding logic itself already has its own coverage elsewhere.
vi.mock("../utils/geocode.js", () => ({
  reverseGeocode: vi.fn().mockResolvedValue("Test Locality"),
}));

function validDonorPayload(overrides = {}) {
  return {
    name: "Test Donor",
    email: "donor@example.com",
    password: "correct-password",
    phone: "9999999999",
    bloodType: "O+",
    city: "Bhopal",
    latitude: 23.2599,
    longitude: 77.4126,
    ...overrides,
  };
}

describe("POST /api/auth/register", () => {
  it("registers a new donor and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(validDonorPayload());

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.donor.email).toBe("donor@example.com");
    // Password hash and push subscription details must never reach the client.
    expect(res.body.donor.password).toBeUndefined();
    expect(res.body.donor.pushSubscriptions).toBeUndefined();
  });

  it("rejects registration when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Incomplete Donor", email: "incomplete@example.com" });

    expect(res.status).toBe(400);
  });

  it("rejects registration with an invalid blood type", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validDonorPayload({ email: "badtype@example.com", bloodType: "Z+" }));

    expect(res.status).toBe(400);
  });

  it("rejects a second registration with an email already in use", async () => {
    await request(app).post("/api/auth/register").send(validDonorPayload());

    const res = await request(app).post("/api/auth/register").send(validDonorPayload());

    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in successfully with the correct password", async () => {
    await request(app).post("/api/auth/register").send(validDonorPayload());

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "donor@example.com", password: "correct-password" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it("rejects login with the wrong password", async () => {
    await request(app).post("/api/auth/register").send(validDonorPayload());

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "donor@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("rejects login for an email that was never registered", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever" });

    expect(res.status).toBe(401);
  });
});