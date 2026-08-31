import express from "express";
import rateLimit from "express-rate-limit";
import BloodRequest from "../models/BloodRequest.js";
import Donor from "../models/Donor.js";
import requireAuth from "../middleware/auth.js";
import { compatibleDonorTypes, BLOOD_TYPES } from "../utils/compatibility.js";
import { sendUrgentAlert } from "../utils/mailer.js";

const router = express.Router();

const DEFAULT_RADIUS_KM = 10;
const EARTH_RADIUS_KM = 6371;

// Basic abuse protection, scoped only to raising a new emergency request —
// viewing/dashboard traffic is never throttled.
const createRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 emergency requests per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests raised from this network recently. Please wait a while, or call your local blood bank directly." },
});

// Haversine distance between two [lng, lat] points, in kilometers.
function distanceKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// POST create a new emergency request, then immediately geo-match + notify
router.post("/", createRequestLimiter, requireAuth, async (req, res) => {
  try {
    const {
      patientName,
      bloodType,
      unitsNeeded,
      hospitalName,
      contactPhone,
      urgency,
      notes,
      latitude,
      longitude,
      radiusKm,
    } = req.body;

    if (!patientName || !bloodType || !hospitalName || !contactPhone) {
      return res.status(400).json({ message: "Patient name, blood type, hospital and phone are required." });
    }
    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ message: "Invalid blood type." });
    }
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Hospital location is required to find nearby donors." });
    }

    const request = await BloodRequest.create({
      requestedBy: req.donorId,
      patientName,
      bloodType,
      unitsNeeded: unitsNeeded || 1,
      hospitalName,
      contactPhone,
      urgency: urgency || "urgent",
      notes: notes || "",
      location: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
    });

    const requestedRadius = Number(radiusKm) || DEFAULT_RADIUS_KM;
    const { matched, radiusUsed } = await matchAndNotify(request, requestedRadius);

    res.status(201).json({ request, matchedDonors: matched, radiusUsedKm: radiusUsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create request. Please try again." });
  }
});

// Core geo-matching: find compatible, available donors within `radiusKm` of
// the request, sorted nearest-first, then email each one. If nothing is
// found at the requested radius, automatically widens the search — an
// emergency request shouldn't just dead-end because the first radius was
// too small.
const ESCALATION_STEPS_KM = [10, 25, 50, 100];

async function findDonorsWithin(request, radiusKm) {
  const eligibleTypes = compatibleDonorTypes(request.bloodType);
  return Donor.find({
    bloodType: { $in: eligibleTypes },
    available: true,
    location: {
      $near: {
        $geometry: request.location,
        $maxDistance: radiusKm * 1000, // meters
      },
    },
  }).limit(50);
}

async function matchAndNotify(request, requestedRadiusKm) {
  const eligibleTypes = compatibleDonorTypes(request.bloodType);

  // Build the escalation ladder: start at whatever the requester asked for,
  // then keep widening through the standard steps that are larger than it.
  const steps = [requestedRadiusKm, ...ESCALATION_STEPS_KM.filter((s) => s > requestedRadiusKm)];

  let donors = [];
  let radiusUsed = requestedRadiusKm;
  for (const radiusKm of steps) {
    donors = await findDonorsWithin(request, radiusKm);
    radiusUsed = radiusKm;
    if (donors.length > 0) break;
  }

  console.log(`Matching request for ${request.bloodType}: eligible donor types = [${eligibleTypes.join(", ")}], radius used = ${radiusUsed}km, found ${donors.length} donor(s)`);

  const notified = [];
  for (const donor of donors) {
    const km = distanceKm(request.location.coordinates, donor.location.coordinates);
    const sent = await sendUrgentAlert({
      to: donor.email,
      donorName: donor.name,
      request,
      distanceKm: km,
    });

    notified.push({
      donor: donor._id,
      distanceKm: km,
      notifiedAt: new Date(),
      response: "pending",
    });

    if (!sent) {
      console.warn(`Email not sent to ${donor.email}, but donor still recorded as notified.`);
    }
  }

  request.notifiedDonors = notified;
  request.status = notified.length > 0 ? "donors_notified" : "pending";
  request.searchRadiusKm = radiusUsed;
  await request.save();

  const matched = donors.map((d, i) => ({
    _id: d._id,
    name: d.name,
    bloodType: d.bloodType,
    city: d.city,
    phone: d.phone,
    totalDonations: d.totalDonations,
    distanceKm: Math.round(notified[i].distanceKm * 10) / 10,
  }));

  return { matched, radiusUsed };
}

// GET all active requests (for dashboard / map view)
router.get("/", requireAuth, async (req, res) => {
  const requests = await BloodRequest.find().sort({ createdAt: -1 }).limit(100);
  res.json(requests);
});

// GET a single request
router.get("/:id", requireAuth, async (req, res) => {
  const request = await BloodRequest.findById(req.params.id)
    .populate("requestedBy", "name phone")
    .populate("notifiedDonors.donor", "name phone bloodType totalDonations");
  if (!request) return res.status(404).json({ message: "Request not found." });

  const isRequester = String(request.requestedBy?._id) === String(req.donorId);

  const payload = request.toObject();

  if (isRequester) {
    // The requester can see full contact details for every notified donor,
    // sorted nearest-first, so they can call directly instead of waiting
    // on someone to check email.
    payload.notifiedDonors = [...payload.notifiedDonors]
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((n) => ({
        donorId: n.donor?._id,
        name: n.donor?.name,
        phone: n.donor?.phone,
        bloodType: n.donor?.bloodType,
        totalDonations: n.donor?.totalDonations || 0,
        distanceKm: n.distanceKm,
        response: n.response,
      }));
  } else {
    // Anyone else (e.g. a donor viewing their own alert) never sees other
    // donors' contact info — only the patient/hospital details already
    // present on the request itself.
    delete payload.notifiedDonors;
  }

  res.json(payload);
});

// PATCH donor accepts or declines a request they were notified about
router.patch("/:id/respond", requireAuth, async (req, res) => {
  const { response } = req.body; // "accepted" | "declined"
  if (!["accepted", "declined"].includes(response)) {
    return res.status(400).json({ message: "Response must be 'accepted' or 'declined'." });
  }

  const request = await BloodRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found." });

  const entry = request.notifiedDonors.find((n) => String(n.donor) === String(req.donorId));
  if (!entry) {
    return res.status(403).json({ message: "You were not notified about this request." });
  }

  entry.response = response;
  if (response === "accepted") {
    request.status = "fulfilled";
    // Track this as a completed donation so requesters can see a donor's
    // track record (a simple trust/reliability signal).
    await Donor.findByIdAndUpdate(req.donorId, {
      $inc: { totalDonations: 1 },
      $set: { lastDonationDate: new Date() },
    });
  }
  await request.save();

  res.json(request);
});

// PATCH mark a request fulfilled/expired manually (by the requester)
router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!["pending", "donors_notified", "fulfilled", "expired"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }
  const request = await BloodRequest.findOneAndUpdate(
    { _id: req.params.id, requestedBy: req.donorId },
    { status },
    { new: true }
  );
  if (!request) return res.status(404).json({ message: "Request not found or not yours to edit." });
  res.json(request);
});

export default router;
