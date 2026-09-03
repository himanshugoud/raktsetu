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

    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

donorSchema.index({ location: "2dsphere" });

// Never send the password hash back to the client
donorSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("Donor", donorSchema);
