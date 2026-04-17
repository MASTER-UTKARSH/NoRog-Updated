import { Router } from "express";
import { callGroq } from "../services/groqService.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getProfile, addMedicineLog } from "../services/firebaseDB.js";

const router = Router();
router.use(authMiddleware);

// POST /api/medicines/check — check drug interactions
router.post("/check", async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!medicines || !medicines.length) {
      return res.status(400).json({ success: false, error: "Provide at least one medicine" });
    }

    const profile = await getProfile(req.user.id);

    const systemPrompt = `You are a pharmacology AI. Check for drug-drug interactions and drug-disease interactions for this patient.

You must respond with ONLY valid JSON. No markdown formatting, no backticks, no explanation text.

Return: {
  "drugInteractions": [
    { "drug1": "string", "drug2": "string", "severity": "mild"|"moderate"|"severe", "description": "string" }
  ],
  "diseaseInteractions": [
    { "drug": "string", "condition": "string", "warning": "string" }
  ],
  "safeToTake": boolean,
  "recommendation": "string"
}`;

    const userMessage = `Medicines to check: ${medicines.join(", ")}
Patient's existing conditions: ${profile?.medicalHistory?.join(", ") || "none"}
Patient's current medicines from profile: ${profile?.medicines?.map(m => m.name).join(", ") || "none"}

Check ALL combinations for interactions. Be thorough.`;

    const result = await callGroq(systemPrompt, userMessage);

    const medLog = await addMedicineLog(req.user.id, {
      medicines,
      interactions: result.drugInteractions || [],
      diseaseInteractions: (result.diseaseInteractions || []).map(d => `${d.drug} + ${d.condition}: ${d.warning}`),
      safeToTake: result.safeToTake ?? true,
      recommendation: result.recommendation || ""
    });

    res.json({ success: true, data: { ...result, logId: medLog._id } });
  } catch (error) {
    console.error("Medicine check error:", error);
    res.status(500).json({ success: false, error: error.message || "Medicine check failed" });
  }
});

export default router;
