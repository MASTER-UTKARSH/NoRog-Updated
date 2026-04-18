import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { findUserById, updateUser, getProfile, saveProfile } from "../services/firebaseDB.js";

const router = Router();
router.use(authMiddleware);

// Allowed values for enum-like fields
const VALID_GENDERS = ["male", "female", "other"];
const VALID_ALCOHOL = ["none", "occasional", "regular"];
const VALID_EXERCISE = ["never", "1-2x", "3-5x", "daily"];
const VALID_DIETS = ["balanced", "vegetarian", "vegan", "keto", "junk-heavy"];

// GET /api/profile
router.get("/", async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const profile = await getProfile(req.user.id);

    // Strip password from response
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, profile } });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

// POST /api/profile — create or update (onboarding)
router.post("/", async (req, res) => {
  try {
    const { age, gender, location, currentSymptoms, medicalHistory, familyHistory, lifestyle, medicines } = req.body;

    // ── Age Validation ──
    let sanitizedAge = undefined;
    if (age !== undefined && age !== null && age !== "") {
      sanitizedAge = Number(age);
      if (isNaN(sanitizedAge) || sanitizedAge < 1 || sanitizedAge > 120 || !Number.isInteger(sanitizedAge)) {
        return res.status(400).json({ success: false, error: "Age must be a whole number between 1 and 120" });
      }
    }

    // ── Gender Validation ──
    let sanitizedGender = undefined;
    if (gender) {
      sanitizedGender = String(gender).toLowerCase().trim();
      if (!VALID_GENDERS.includes(sanitizedGender)) {
        return res.status(400).json({ success: false, error: "Invalid gender value" });
      }
    }

    // ── Location Validation ──
    let sanitizedLocation = undefined;
    if (location && typeof location === "object") {
      sanitizedLocation = {
        city: String(location.city || "").trim().slice(0, 100),
        country: String(location.country || "").trim().slice(0, 100)
      };
    }

    // ── Array Fields Validation ──
    const safeCurrentSymptoms = Array.isArray(currentSymptoms)
      ? currentSymptoms.filter(s => typeof s === "string").map(s => s.trim().slice(0, 100)).slice(0, 50)
      : [];

    const safeMedicalHistory = Array.isArray(medicalHistory)
      ? medicalHistory.filter(s => typeof s === "string").map(s => s.trim().slice(0, 100)).slice(0, 50)
      : [];

    const safeFamilyHistory = Array.isArray(familyHistory)
      ? familyHistory
          .filter(fh => fh && typeof fh === "object" && typeof fh.relation === "string" && typeof fh.condition === "string")
          .map(fh => ({
            relation: fh.relation.trim().slice(0, 50),
            condition: fh.condition.trim().slice(0, 100)
          }))
          .slice(0, 30)
      : [];

    // ── Lifestyle Validation ──
    let safeLifestyle = {};
    if (lifestyle && typeof lifestyle === "object") {
      safeLifestyle = {
        smoker: Boolean(lifestyle.smoker),
        alcohol: VALID_ALCOHOL.includes(lifestyle.alcohol) ? lifestyle.alcohol : "none",
        exerciseFrequency: VALID_EXERCISE.includes(lifestyle.exerciseFrequency) ? lifestyle.exerciseFrequency : "never",
        sleepHours: (typeof lifestyle.sleepHours === "number" && lifestyle.sleepHours >= 1 && lifestyle.sleepHours <= 24)
          ? lifestyle.sleepHours
          : 7,
        diet: VALID_DIETS.includes(lifestyle.diet) ? lifestyle.diet : "balanced"
      };
    }

    // ── Medicines Validation ──
    const safeMedicines = Array.isArray(medicines)
      ? medicines
          .filter(m => m && typeof m === "object" && typeof m.name === "string" && m.name.trim())
          .map(m => ({
            name: m.name.trim().slice(0, 100),
            dosage: String(m.dosage || "").trim().slice(0, 50),
            frequency: String(m.frequency || "daily").trim().slice(0, 30)
          }))
          .slice(0, 30)
      : [];

    // Update user demographics
    const updatedUser = await updateUser(req.user.id, {
      ...(sanitizedAge !== undefined && { age: sanitizedAge }),
      ...(sanitizedGender && { gender: sanitizedGender }),
      ...(sanitizedLocation && { location: sanitizedLocation })
    });

    // Update health profile
    const profile = await saveProfile(req.user.id, {
      currentSymptoms: safeCurrentSymptoms,
      medicalHistory: safeMedicalHistory,
      familyHistory: safeFamilyHistory,
      lifestyle: safeLifestyle,
      medicines: safeMedicines,
      onboardingComplete: true
    });

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
});

// PUT /api/profile/medicines
router.put("/medicines", async (req, res) => {
  try {
    const { medicines } = req.body;
    const safeMedicines = Array.isArray(medicines)
      ? medicines
          .filter(m => m && typeof m === "object" && typeof m.name === "string" && m.name.trim())
          .map(m => ({
            name: m.name.trim().slice(0, 100),
            dosage: String(m.dosage || "").trim().slice(0, 50),
            frequency: String(m.frequency || "daily").trim().slice(0, 30)
          }))
          .slice(0, 30)
      : [];

    const profile = await saveProfile(req.user.id, { medicines: safeMedicines });
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Update medicines error:", error);
    res.status(500).json({ success: false, error: "Failed to update medicines" });
  }
});

export default router;
