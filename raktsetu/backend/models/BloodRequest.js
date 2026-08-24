import mongoose from "mongoose";
import { BLOOD_TYPES } from "../utils/compatibility.js";

const bloodRequestSchema = new mongoose.Schema(
  {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
    patientName: { type: String, required: true, trim: true },
    bloodType: { type: String, required: true, enum: BLOOD_TYPES },
    unitsNeeded: { type: Number, default: 1, min: 1 },
    hospitalName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    urgency: {
      type: String,
      enum: ["critical", "urgent", "scheduled"],
      default: "urgent",
    },
    notes: { type: String, trim: true, default: "" },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["pending", "donors_notified", "fulfilled", "expired"],
      default: "pending",
    },

    notifiedDonors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
        distanceKm: Number,
        notifiedAt: { type: Date, default: Date.now },
        response: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
      },
    ],
  },
  { timestamps: true }
);

bloodRequestSchema.index({ location: "2dsphere" });

export default mongoose.model("BloodRequest", bloodRequestSchema);
