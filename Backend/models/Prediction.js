import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, default: Date.now },
    risks: [
      {
        disease: String,
        confidence: Number,
        contributingSymptoms: [String],
        urgency: { type: String, enum: ["Monitor", "See doctor soon", "Seek immediate care"] },
        geneticFactor: { type: Boolean, default: false },
        _id: false
      }
    ],
    healthScore: { type: Number, min: 0, max: 100, default: 75 },
    trend: { type: String, enum: ["improving", "stable", "declining"], default: "stable" },
    correlations: [
      {
        symptoms: [String],
        possibleCondition: String,
        _id: false
      }
    ],
    seasonalAlert: { type: String, default: "" },
    summary: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", PredictionSchema);
