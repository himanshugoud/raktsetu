import express from "express";
import * as Sentry from "@sentry/node";
import Donor from "../models/Donor.js";
import BloodRequest from "../models/BloodRequest.js";

const router = express.Router();

const EMPTY_STATUS_COUNTS = { pending: 0, donors_notified: 0, fulfilled: 0, expired: 0 };

// Public, lightweight stats used on the homepage and the impact page.
// No auth required — this endpoint only ever returns aggregate counts,
// never individual donor or request data, so there's no privacy concern
// in leaving it open.
router.get("/", async (_req, res) => {
  try {
    const [donorCount, totalRequests, statusAgg, donorsByMonthAgg] = await Promise.all([
      Donor.countDocuments({}),
      BloodRequest.countDocuments({}),
      BloodRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Donor.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const requestsByStatus = { ...EMPTY_STATUS_COUNTS };
    statusAgg.forEach((s) => {
      if (s._id in requestsByStatus) requestsByStatus[s._id] = s.count;
    });

    // A running total reads as a growth curve, which is more meaningful
    // than isolated per-month signup counts.
    let runningTotal = 0;
    const donorGrowth = donorsByMonthAgg.map((m) => {
      runningTotal += m.count;
      return { month: m._id, donors: runningTotal };
    });

    res.json({
      donorCount,
      totalRequests,
      fulfilledRequests: requestsByStatus.fulfilled,
      requestsByStatus,
      donorGrowth,
    });
  } catch (err) {
    console.error(err);
    Sentry.captureException(err);
    res.status(500).json({ message: "Could not load stats." });
  }
});

export default router;