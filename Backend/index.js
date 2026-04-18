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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://no-rog.netlify.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options("(.*)", cors()); // Correct wildcard syntax for Express 5 preflight handled by path-to-regexp
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
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "NoRog API",
    version: "4.0.0",
    storage: "Firebase/Firestore",
    status: "running"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🩺 NoRog API Server running on port ${PORT}`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`📡 Storage: Firebase Firestore\n`);
});
