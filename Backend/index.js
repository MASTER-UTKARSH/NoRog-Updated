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
import chatRoutes from "./routes/chat.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── CORS Configuration ──
// This MUST be the very first middleware, before everything else.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://no-rog.netlify.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "Noरोग API",
    version: "4.0.0",
    storage: "Firebase/Firestore",
    status: "running"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`\nNoरोग API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`Storage: Firebase Firestore\n`);
});
