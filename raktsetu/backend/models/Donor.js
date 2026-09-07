import mongoose from "mongoose";
import { BLOOD_TYPES } from "../utils/compatibility.js";

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    bloodType: { type: String, required: true, enum: BLOOD_TYPES },
    city: { type: String, required: true, trim: true },

    // GeoJSON point, required for MongoDB 2dsphere geo queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        required: true,
      },
    },

    available: { type: Boolean, default: true },
    lastDonationDate: { type: Date, default: null },
    totalDonations: { type: Number, default: 0 },

    // Human-readable neighbourhood/locality, filled in via reverse geocoding
    // when the donor registers or updates their location. Null if the
    // geocoding lookup failed or hasn't run yet — always optional, never
    // required, so this can never block registration.
    areaName: { type: String, default: null },

    // Web Push subscriptions (one per browser/device the donor has enabled
    // notifications on). Each is exactly what the browser's PushManager
    // returns — endpoint + encryption keys — nothing else.
    pushSubscriptions: {
      type: [
        {
          endpoint: { type: String, required: true },
          keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
          },
        },
      ],
      default: [],
    },

    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

donorSchema.index({ location: "2dsphere" });

// Never send the password hash — or push subscription details, which
// are effectively per-device tracking identifiers — back to the client.
donorSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.pushSubscriptions;
    return ret;
  },
});

export default mongoose.model("Donor", donorSchema);