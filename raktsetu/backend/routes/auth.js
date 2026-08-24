import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Donor from "../models/Donor.js";
import { BLOOD_TYPES } from "../utils/compatibility.js";

const router = express.Router();

function signToken(donor) {
  return jwt.sign({ id: donor._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
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
    res.status(201).json({ token, donor });
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
    res.json({ token, donor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

export default router;
