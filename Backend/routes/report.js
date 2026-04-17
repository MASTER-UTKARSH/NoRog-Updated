import { Router } from "express";
import { generateHealthPDF } from "../services/pdfService.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  findUserById,
  getProfile,
  getSymptomLogs,
  getLatestPrediction,
  getLatestMedicineLog
} from "../services/firebaseDB.js";

const router = Router();
router.use(authMiddleware);

// GET /api/report/generate — generate and download PDF report
router.get("/generate", async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    const profile = await getProfile(req.user.id);
    const symptomLogs = await getSymptomLogs(req.user.id, 30);
    const prediction = await getLatestPrediction(req.user.id);
    const latestMed = await getLatestMedicineLog(req.user.id);
    const medicineLogs = latestMed ? [latestMed] : [];

    const { password: _, ...safeUser } = user || {};

    const pdfBuffer = await generateHealthPDF({
      user: safeUser,
      profile,
      symptomLogs,
      prediction,
      medicineLogs
    });

    const filename = `HealthReport_${safeUser?.name?.replace(/\s+/g, "_") || "Patient"}_${new Date().toISOString().split("T")[0]}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ success: false, error: "Failed to generate report" });
  }
});

export default router;
