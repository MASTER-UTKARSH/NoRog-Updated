import mongoose from "mongoose";

const MedicineLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicines: { type: [String], default: [] },
    interactions: [
      {
        drug1: String,
        drug2: String,
        severity: { type: String, enum: ["mild", "moderate", "severe"] },
        description: String,
        _id: false
      }
    ],
    diseaseInteractions: { type: [String], default: [] },
    safeToTake: { type: Boolean, default: true },
    recommendation: { type: String, default: "" },
    checkedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("MedicineLog", MedicineLogSchema);
