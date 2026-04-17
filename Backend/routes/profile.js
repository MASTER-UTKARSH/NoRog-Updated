import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { findUserById, updateUser, getProfile, saveProfile } from "../services/firebaseDB.js";

const router = Router();
router.use(authMiddleware);

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

    // Update user demographics
    const updatedUser = await updateUser(req.user.id, {
      ...(age !== undefined && { age }),
      ...(gender && { gender }),
      ...(location && { location })
    });

    // Update health profile
    const profile = await saveProfile(req.user.id, {
      currentSymptoms: currentSymptoms || [],
      medicalHistory: medicalHistory || [],
      familyHistory: familyHistory || [],
      lifestyle: lifestyle || {},
      medicines: medicines || [],
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
    const profile = await saveProfile(req.user.id, { medicines: medicines || [] });
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Update medicines error:", error);
    res.status(500).json({ success: false, error: "Failed to update medicines" });
  }
});

export default router;
