import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { callGroq } from "../services/groqService.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addSymptomLog,
  getSymptomLogs,
  updateSymptomLog,
  getProfile
} from "../services/firebaseDB.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();
router.use(authMiddleware);

// POST /api/symptoms/log
router.post("/log", upload.single("photo"), async (req, res) => {
  try {
    const { symptoms, severity, notes } = req.body;
    const parsedSymptoms = typeof symptoms === "string" ? JSON.parse(symptoms) : symptoms;

    let photoUrl = "";
    let photoAIDescription = "";

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
      try {
        const photoResult = await callGroq(
          `You are a medical AI assistant. The user has uploaded a photo of a symptom along with these reported symptoms: ${parsedSymptoms.join(", ")}. Provide a helpful description of what these symptoms could indicate. Return ONLY valid JSON with no markdown, no backticks: { "description": "string describing likely visual symptoms", "flaggedSymptoms": ["array of concerning symptoms"], "urgencyFlag": "none|monitor|see_doctor" }`,
          `The patient reports these symptoms: ${parsedSymptoms.join(", ")} with severity ${severity}/10. Notes: ${notes || "none"}. They have uploaded a photo of their symptoms. Please analyze.`
        );
        photoAIDescription = photoResult.description || "";
      } catch (err) {
        console.warn("Photo AI analysis failed, continuing:", err.message);
      }
    }

    // Create the log entry (save to disk)
    let log = await addSymptomLog(req.user.id, {
      symptoms: parsedSymptoms,
      severity: Number(severity) || 5,
      notes: notes || "",
      photoUrl,
      photoAIDescription,
      warningFlagged: false,
      warningReason: "",
      warningUrgency: "none"
    });

    // Auto early-warning check
    let warning = null;
    try {
      const recentLogs = await getSymptomLogs(req.user.id, 10);
      const profile = await getProfile(req.user.id);

      const warningResult = await callGroq(
        `You are an early warning medical AI. Analyze recent symptom patterns for urgent health concerns. You must respond with ONLY valid JSON. No markdown, no backticks, no text before or after. Just the raw JSON object.`,
        `New symptoms logged today: ${parsedSymptoms.join(", ")} (severity: ${severity}/10)

Recent symptom history (last 10 entries): ${JSON.stringify(recentLogs.map(l => ({
          date: l.createdAt, symptoms: l.symptoms, severity: l.severity
        })))}

Patient's existing conditions: ${profile?.medicalHistory?.join(", ") || "none"}

Return: { "warningTriggered": boolean, "reason": "string or null", "urgency": "none|monitor|see_doctor" }`
      );

      if (warningResult.warningTriggered) {
        log = await updateSymptomLog(req.user.id, log._id, {
          warningFlagged: true,
          warningReason: warningResult.reason || "",
          warningUrgency: warningResult.urgency || "monitor"
        });
        warning = warningResult;
      }
    } catch (err) {
      console.warn("Early warning check failed:", err.message);
    }

    res.status(201).json({ success: true, data: { log, warning } });
  } catch (error) {
    console.error("Log symptom error:", error);
    res.status(500).json({ success: false, error: "Failed to log symptoms" });
  }
});

// GET /api/symptoms/history
router.get("/history", async (req, res) => {
  try {
    const logs = await getSymptomLogs(req.user.id, 50);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch history" });
  }
});

export default router;
