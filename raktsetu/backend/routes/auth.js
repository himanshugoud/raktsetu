import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Donor from "../models/Donor.js";
import { BLOOD_TYPES } from "../utils/compatibility.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const router = express.Router();

const DONATION_COOLDOWN_DAYS = 90;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function signToken(donor) {
  return jwt.sign({ id: donor._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function withEligibility(donor) {
  const obj = donor.toJSON ? donor.toJSON() : donor;
  if (obj.lastDonationDate) {
    const eligibleAgainAt = new Date(
      new Date(obj.lastDonationDate).getTime() + DONATION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    );
    obj.eligibleAgainAt = eligibleAgainAt;
    obj.inCooldown = eligibleAgainAt > new Date();
  } else {
    obj.eligibleAgainAt = null;
    obj.inCooldown = false;
  }
  return obj;
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, bloodType, city, latitude, longitude } = req.body;

    if (!name || !email || !password || !phone || !bloodType || !city) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ message: "Invalid blood type." });
    }
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Location is required to match you to nearby requests." });
    }

    const existing = await Donor.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const donor = await Donor.create({
      name,
      email,
      password: hashed,
      phone,
      bloodType,
      city,
      location: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
    });

    const token = signToken(donor);
    res.status(201).json({ token, donor: withEligibility(donor) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const donor = await Donor.findOne({ email: email.toLowerCase() });
    if (!donor) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, donor.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(donor);
    res.json({ token, donor: withEligibility(donor) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const donor = await Donor.findOne({ email: email.toLowerCase() });

    // Always respond the same way whether or not the account exists —
    // this stops the endpoint from being used to check which emails are
    // registered donors.
    const genericResponse = {
      message: "If an account with that email exists, we've sent a password reset link.",
    };

    if (!donor) {
      return res.json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    donor.resetPasswordTokenHash = tokenHash;
    donor.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await donor.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(donor.email)}`;

    await sendPasswordResetEmail({ to: donor.email, donorName: donor.name, resetUrl });

    res.json(genericResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const donor = await Donor.findOne({ email: email.toLowerCase() });
    if (!donor || !donor.resetPasswordTokenHash || !donor.resetPasswordExpires) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    if (donor.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "This reset link has expired. Please request a new one." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== donor.resetPasswordTokenHash) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    donor.password = await bcrypt.hash(password, 10);
    donor.resetPasswordTokenHash = null;
    donor.resetPasswordExpires = null;
    await donor.save();

    res.json({ message: "Your password has been reset. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

export default router;
