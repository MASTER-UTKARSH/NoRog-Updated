import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other", ""] },
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
