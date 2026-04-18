import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserById,
  createUser,
  getProfile,
  saveProfile,
  generateId
} from "../services/firebaseDB.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // ── Input Validation ──
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required" });
    }

    // Sanitize
    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    password = String(password);

    // Name validation
    if (name.length < 2) {
      return res.status(400).json({ success: false, error: "Name must be at least 2 characters" });
    }
    if (name.length > 50) {
      return res.status(400).json({ success: false, error: "Name must be under 50 characters" });
    }
    if (!/^[a-zA-Z\s.'\-]+$/.test(name)) {
      return res.status(400).json({ success: false, error: "Name contains invalid characters" });
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: "Invalid email format" });
    }
    if (email.length > 254) {
      return res.status(400).json({ success: false, error: "Email is too long" });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }
    if (password.length > 128) {
      return res.status(400).json({ success: false, error: "Password is too long" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId();

    const user = await createUser({ id, name, email, password: hashedPassword });

    // Create empty health profile
    await saveProfile(id, { onboardingComplete: false });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email }
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // Sanitize
    email = String(email).trim().toLowerCase();
    password = String(password);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: "Invalid email format" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const profile = await getProfile(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          location: user.location
        },
        onboardingComplete: profile?.onboardingComplete || false
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
});

export default router;
