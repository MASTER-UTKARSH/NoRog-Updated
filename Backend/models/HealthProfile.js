import mongoose from "mongoose";

const HealthProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    currentSymptoms: { type: [String], default: [] },
    medicalHistory: { type: [String], default: [] },
    familyHistory: [
      {
        relation: { type: String },
        condition: { type: String },
        _id: false
      }
    ],
    lifestyle: {
      smoker: { type: Boolean, default: false },
      alcohol: { type: String, enum: ["none", "occasional", "regular"], default: "none" },
      exerciseFrequency: { type: String, enum: ["never", "1-2x", "3-5x", "daily"], default: "never" },
      sleepHours: { type: Number, default: 7 },
      diet: { type: String, default: "balanced" }
    },
    medicines: [
      {
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        _id: false
      }
    ],
    onboardingComplete: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("HealthProfile", HealthProfileSchema);
