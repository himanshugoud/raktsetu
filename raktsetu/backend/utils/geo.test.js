import { describe, it, expect } from "vitest";
import { distanceKm, buildRadiusSteps } from "./geo.js";

describe("distanceKm", () => {
  it("returns 0 for the same point", () => {
    expect(distanceKm([77.4, 23.2], [77.4, 23.2])).toBeCloseTo(0, 5);
  });

  it("matches a known real-world distance (Delhi to Mumbai, ~1150km great-circle)", () => {
    const delhi = [77.209, 28.6139];
    const mumbai = [72.8777, 19.076];
    const km = distanceKm(delhi, mumbai);
    // Great-circle distance is well documented as roughly 1150km; allow a
    // generous tolerance since this is a sanity check, not a precision test.
    expect(km).toBeGreaterThan(1100);
    expect(km).toBeLessThan(1200);
  });

  it("is symmetric — distance A to B equals B to A", () => {
    const a = [77.4, 23.2];
    const b = [72.8, 19.1];
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 8);
  });

  it("gives a small distance for points a few hundred meters apart", () => {
    const km = distanceKm([77.4764, 23.2491], [77.4774, 23.2491]);
    expect(km).toBeGreaterThan(0);
    expect(km).toBeLessThan(1);
  });
});

describe("buildRadiusSteps", () => {
  const STANDARD_STEPS = [10, 25, 50, 100];

  it("starts with the requester's own radius first", () => {
    const steps = buildRadiusSteps(10, STANDARD_STEPS);
    expect(steps[0]).toBe(10);
  });

  it("only includes escalation steps larger than the requested radius", () => {
    const steps = buildRadiusSteps(25, STANDARD_STEPS);
    expect(steps).toEqual([25, 50, 100]);
  });

  it("handles a custom radius that falls between standard steps", () => {
    const steps = buildRadiusSteps(15, STANDARD_STEPS);
    expect(steps).toEqual([15, 25, 50, 100]);
  });

  it("never repeats the same radius twice", () => {
    const steps = buildRadiusSteps(10, STANDARD_STEPS);
    expect(new Set(steps).size).toBe(steps.length);
  });

  it("still returns just the requested radius if it's already the largest", () => {
    const steps = buildRadiusSteps(150, STANDARD_STEPS);
    expect(steps).toEqual([150]);
  });
});
