import { describe, it, expect } from "vitest";
import { BLOOD_TYPES, isCompatible, compatibleDonorTypes, compatibleRecipientTypes } from "./compatibility.js";

describe("compatibility matrix", () => {
  it("has all 8 standard ABO/Rh blood types", () => {
    expect(BLOOD_TYPES).toHaveLength(8);
    expect(BLOOD_TYPES).toEqual(
      expect.arrayContaining(["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"])
    );
  });

  it("treats O- as the universal donor", () => {
    for (const recipient of BLOOD_TYPES) {
      expect(isCompatible("O-", recipient)).toBe(true);
    }
  });

  it("treats AB+ as the universal recipient", () => {
    for (const donor of BLOOD_TYPES) {
      expect(isCompatible(donor, "AB+")).toBe(true);
    }
  });

  it("only lets O+ receive from O- and O+", () => {
    expect(compatibleDonorTypes("O+").sort()).toEqual(["O+", "O-"]);
  });

  it("never lets an Rh- patient receive Rh+ blood", () => {
    const rhNegativeRecipients = BLOOD_TYPES.filter((t) => t.endsWith("-"));
    for (const recipient of rhNegativeRecipients) {
      const donors = compatibleDonorTypes(recipient);
      expect(donors.every((d) => d.endsWith("-"))).toBe(true);
    }
  });

  it("matches a specific well-known real-world case: A+ can receive from O-, O+, A-, A+ only", () => {
    expect(compatibleDonorTypes("A+").sort()).toEqual(["A+", "A-", "O+", "O-"]);
  });

  it("compatibleRecipientTypes is the exact inverse of compatibleDonorTypes", () => {
    for (const donor of BLOOD_TYPES) {
      for (const recipient of BLOOD_TYPES) {
        const viaRecipientList = compatibleDonorTypes(recipient).includes(donor);
        const viaDonorList = compatibleRecipientTypes(donor).includes(recipient);
        expect(viaRecipientList).toBe(viaDonorList);
      }
    }
  });

  it("rejects unknown blood type strings instead of silently matching", () => {
    expect(isCompatible("X+", "A+")).toBe(false);
    expect(isCompatible("A+", "X+")).toBe(false);
    expect(compatibleDonorTypes("X+")).toEqual([]);
  });
});
