import mongoose from "mongoose";

const SymptomLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, default: Date.now },
    symptoms: { type: [String], required: true },
    severity: { type: Number, min: 1, max: 10, default: 5 },
    notes: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    photoAIDescription: { type: String, default: "" },
    warningFlagged: { type: Boolean, default: false },
    warningReason: { type: String, default: "" },
    warningUrgency: { type: String, enum: ["none", "monitor", "see_doctor"], default: "none" }
  },
  { timestamps: true }
);

export default mongoose.model("SymptomLog", SymptomLogSchema);
