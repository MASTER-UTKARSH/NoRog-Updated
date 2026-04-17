import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import symptomRoutes from "./routes/symptoms.js";
import aiRoutes from "./routes/ai.js";
import medicineRoutes from "./routes/medicines.js";
import reportRoutes from "./routes/report.js";
import { DATA_ROOT } from "./services/localDB.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/report", reportRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "NoRog API",
    version: "4.0.0",
    storage: "local-filesystem",
    dataRoot: DATA_ROOT,
    status: "running",
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET  /api/profile",
      "POST /api/profile",
      "POST /api/symptoms/log",
      "GET  /api/symptoms/history",
      "POST /api/ai/predict",
      "POST /api/ai/whatif",
      "POST /api/ai/seasonal",
      "POST /api/medicines/check",
      "GET  /api/report/generate"
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🩺 NoRog API Server v4.0 (Local Storage) running on http://localhost:${PORT}`);
  console.log(`📁 Data folder: ${DATA_ROOT}`);
  console.log(`   Auth:      POST http://localhost:${PORT}/api/auth/register | login`);
  console.log(`   Profile:   GET/POST http://localhost:${PORT}/api/profile`);
  console.log(`   Symptoms:  POST http://localhost:${PORT}/api/symptoms/log`);
  console.log(`   AI:        POST http://localhost:${PORT}/api/ai/predict | whatif | seasonal`);
  console.log(`   Medicines: POST http://localhost:${PORT}/api/medicines/check`);
  console.log(`   Report:    GET  http://localhost:${PORT}/api/report/generate\n`);
});
