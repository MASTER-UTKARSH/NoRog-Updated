import mongoose from "mongoose";

const TimeframeSchema = new mongoose.Schema(
  {
    summary: { type: String, default: "" },
    worseningConditions: { type: [String], default: [] },
    newRisks: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    healthScoreChange: { type: Number, default: 0 }
  },
  { _id: false }
);

const WhatIfLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, default: Date.now },
    scenario: { type: String, required: true },
    impact: {
      oneYear: { type: TimeframeSchema, default: () => ({}) },
      fiveYear: { type: TimeframeSchema, default: () => ({}) },
      tenYear: { type: TimeframeSchema, default: () => ({}) }
    }
  },
  { timestamps: true }
);

export default mongoose.model("WhatIfLog", WhatIfLogSchema);
