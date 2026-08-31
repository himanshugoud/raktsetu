import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import Donor from "../models/Donor.js";
import requireAuth from "../middleware/auth.js";
import { compatibleDonorTypes, BLOOD_TYPES } from "../utils/compatibility.js";
import { sendUrgentAlert } from "../utils/mailer.js";

const router = express.Router();

const DEFAULT_RADIUS_KM = 10;
const EARTH_RADIUS_KM = 6371;

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
router.post("/", requireAuth, async (req, res) => {
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

    const radius = Number(radiusKm) || DEFAULT_RADIUS_KM;
    const matched = await matchAndNotify(request, radius);

    res.status(201).json({ request, matchedDonors: matched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create request. Please try again." });
  }
});

// Core geo-matching: find compatible, available donors within `radiusKm` of
// the request, sorted nearest-first, then email each one.
async function matchAndNotify(request, radiusKm) {
  const eligibleTypes = compatibleDonorTypes(request.bloodType);

  const donors = await Donor.find({
    bloodType: { $in: eligibleTypes },
    available: true,
    location: {
      $near: {
        $geometry: request.location,
        $maxDistance: radiusKm * 1000, // meters
      },
    },
  }).limit(50);
  
console.log(`Matching request for ${request.bloodType}: eligible donor types = [${eligibleTypes.join(", ")}], radius = ${radiusKm}km, found ${donors.length} donor(s)`);

console.log(`Request location [lng, lat]: ${JSON.stringify(request.location.coordinates)}`);

const allEligibleTypeDonors = await Donor.find({ bloodType: { $in: eligibleTypes } });
for (const d of allEligibleTypeDonors) {
  const km = distanceKm(request.location.coordinates, d.location.coordinates);
  console.log(`  Donor ${d.name} (${d.bloodType}, available=${d.available}) at [${d.location.coordinates}] — ${km.toFixed(2)}km away`);
}

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
  await request.save();

  return donors.map((d, i) => ({
    _id: d._id,
    name: d.name,
    bloodType: d.bloodType,
    city: d.city,
    phone: d.phone,
    distanceKm: Math.round(notified[i].distanceKm * 10) / 10,
  }));
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
    .populate("notifiedDonors.donor", "name phone bloodType");
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
