import express from "express";
import Donor from "../models/Donor.js";
import BloodRequest from "../models/BloodRequest.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

// GET current donor's profile
router.get("/me", requireAuth, async (req, res) => {
  const donor = await Donor.findById(req.donorId);
  if (!donor) return res.status(404).json({ message: "Donor not found." });
  res.json(donor);
});

// PATCH toggle / update availability
router.patch("/me/availability", requireAuth, async (req, res) => {
  const { available } = req.body;
  const donor = await Donor.findByIdAndUpdate(
    req.donorId,
    { available: Boolean(available) },
    { new: true }
  );
  res.json(donor);
});

// PATCH update location (e.g. donor moved cities)
router.patch("/me/location", requireAuth, async (req, res) => {
  const { latitude, longitude, city } = req.body;
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: "Latitude and longitude are required." });
  }
  const donor = await Donor.findByIdAndUpdate(
    req.donorId,
    {
      location: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
      ...(city ? { city } : {}),
    },
    { new: true }
  );
  res.json(donor);
});

// GET request history relevant to the logged-in donor (requests they were
// notified about, most recent first)
router.get("/me/history", requireAuth, async (req, res) => {
  const requests = await BloodRequest.find({ "notifiedDonors.donor": req.donorId })
    .sort({ createdAt: -1 })
    .lean();

  const history = requests.map((r) => {
    const entry = r.notifiedDonors.find((n) => String(n.donor) === String(req.donorId));
    return {
      _id: r._id,
      bloodType: r.bloodType,
      hospitalName: r.hospitalName,
      urgency: r.urgency,
      status: r.status,
      distanceKm: entry?.distanceKm,
      response: entry?.response,
      createdAt: r.createdAt,
    };
  });

  res.json(history);
});

export default router;
