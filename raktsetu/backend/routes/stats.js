import express from "express";
import Donor from "../models/Donor.js";

const router = express.Router();

// Public, lightweight stats used on the homepage. No auth required —
// this endpoint only ever returns aggregate counts, never individual
// donor data, so there's no privacy concern in leaving it open.
router.get("/", async (_req, res) => {
  try {
    const donorCount = await Donor.countDocuments({});
    res.json({ donorCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load stats." });
  }
});

export default router;