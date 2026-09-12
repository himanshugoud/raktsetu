import { beforeAll, afterEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Donor from "../models/Donor.js";
import BloodRequest from "../models/BloodRequest.js";

// Runs once before any integration test: starts a real (but throwaway,
// in-memory) MongoDB instance and connects Mongoose to it. This lets
// integration tests exercise real Mongoose models and real geo queries
// (2dsphere $near) without touching the actual Atlas database.
let mongod;

// A couple of environment variables the routes read at request time.
// Set here so every test file gets consistent, predictable values.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Mongoose builds indexes (including the 2dsphere geo indexes the
  // matching engine depends on) in the background after connecting.
  // Locally that finishes fast enough to not notice, but on a fresh
  // CI runner it can still be building when the first $near query
  // runs, causing an otherwise-passing test to fail. Model.init()
  // resolves only once its indexes are actually ready, so awaiting
  // both here removes that race entirely.
  await Promise.all([Donor.init(), BloodRequest.init()]);
}, 60000); // first run downloads a MongoDB binary — give it room to finish

// Wipe all collections between individual tests so one test's data never
// leaks into and affects the next.
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});