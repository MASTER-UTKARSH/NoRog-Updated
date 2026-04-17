/**
 * localDB.js — NoRog Local File-Based Database
 *
 * Data layout on disk:
 *   NoRog-aman/Backend/norog_data/
 *     users.json                    ← index of all users (email → userId map)
 *     user_<userId>/
 *       meta.json                   ← name, email, hashedPassword, age, gender, location
 *       profile.json                ← health profile (symptoms, history, lifestyle, medicines)
 *       symptoms.json               ← array of symptom logs
 *       predictions.json            ← array of AI predictions
 *       whatif_logs.json            ← array of what-if analyses
 *       medicine_logs.json          ← array of medicine interaction checks
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_ROOT = path.join(__dirname, "..", "norog_data");

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJSON(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function userDir(userId) {
  const dir = path.join(DATA_ROOT, `user_${userId}`);
  ensureDir(dir);
  return dir;
}

function userFile(userId, name) {
  return path.join(userDir(userId), name);
}

function usersIndexPath() {
  return path.join(DATA_ROOT, "users.json");
}

// ── Initialise data root ──────────────────────────────────────────────────────
ensureDir(DATA_ROOT);

// ─────────────────────────────────────────────────────────────────────────────
// USER INDEX  (email → {id, name, email})
// ─────────────────────────────────────────────────────────────────────────────

export function getAllUsers() {
  return readJSON(usersIndexPath(), {});
}

function saveUsersIndex(index) {
  writeJSON(usersIndexPath(), index);
}

// ─────────────────────────────────────────────────────────────────────────────
// USER  (meta.json)
// ─────────────────────────────────────────────────────────────────────────────

export function createUser({ id, name, email, password }) {
  const index = getAllUsers();
  index[email.toLowerCase()] = { id, name, email: email.toLowerCase() };
  saveUsersIndex(index);

  const meta = { id, name, email: email.toLowerCase(), password, createdAt: new Date().toISOString() };
  writeJSON(userFile(id, "meta.json"), meta);
  return meta;
}

export function findUserByEmail(email) {
  const index = getAllUsers();
  const entry = index[email.toLowerCase()];
  if (!entry) return null;
  return readJSON(userFile(entry.id, "meta.json"), null);
}

export function findUserById(id) {
  return readJSON(userFile(id, "meta.json"), null);
}

export function updateUser(id, updates) {
  const existing = findUserById(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, id }; // always keep id
  writeJSON(userFile(id, "meta.json"), updated);

  // Keep index name in sync if name changed
  if (updates.name || updates.email) {
    const index = getAllUsers();
    const email = updated.email;
    index[email] = { id, name: updated.name, email };
    saveUsersIndex(index);
  }
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH PROFILE  (profile.json)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE = {
  currentSymptoms: [],
  medicalHistory: [],
  familyHistory: [],
  lifestyle: {},
  medicines: [],
  onboardingComplete: false,
  updatedAt: null
};

export function getProfile(userId) {
  return readJSON(userFile(userId, "profile.json"), { ...DEFAULT_PROFILE, userId });
}

export function saveProfile(userId, data) {
  const existing = getProfile(userId);
  const updated = { ...existing, ...data, userId, updatedAt: new Date().toISOString() };
  writeJSON(userFile(userId, "profile.json"), updated);
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYMPTOM LOGS  (symptoms.json — array, newest first after sort)
// ─────────────────────────────────────────────────────────────────────────────

export function addSymptomLog(userId, log) {
  const file = userFile(userId, "symptoms.json");
  const logs = readJSON(file, []);
  const entry = {
    _id: generateId(),
    userId,
    ...log,
    createdAt: new Date().toISOString()
  };
  logs.push(entry);
  writeJSON(file, logs);
  return entry;
}

export function getSymptomLogs(userId, limit = 50) {
  const file = userFile(userId, "symptoms.json");
  const logs = readJSON(file, []);
  return [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

export function updateSymptomLog(userId, logId, updates) {
  const file = userFile(userId, "symptoms.json");
  const logs = readJSON(file, []);
  const idx = logs.findIndex(l => l._id === logId);
  if (idx === -1) return null;
  logs[idx] = { ...logs[idx], ...updates };
  writeJSON(file, logs);
  return logs[idx];
}

// ─────────────────────────────────────────────────────────────────────────────
// PREDICTIONS  (predictions.json)
// ─────────────────────────────────────────────────────────────────────────────

export function addPrediction(userId, data) {
  const file = userFile(userId, "predictions.json");
  const preds = readJSON(file, []);
  const entry = { _id: generateId(), userId, ...data, createdAt: new Date().toISOString() };
  preds.push(entry);
  writeJSON(file, preds);
  return entry;
}

export function getLatestPrediction(userId) {
  const file = userFile(userId, "predictions.json");
  const preds = readJSON(file, []);
  if (!preds.length) return null;
  return [...preds].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT-IF LOGS  (whatif_logs.json)
// ─────────────────────────────────────────────────────────────────────────────

export function addWhatIfLog(userId, data) {
  const file = userFile(userId, "whatif_logs.json");
  const logs = readJSON(file, []);
  const entry = { _id: generateId(), userId, ...data, createdAt: new Date().toISOString() };
  logs.push(entry);
  writeJSON(file, logs);
  return entry;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDICINE LOGS  (medicine_logs.json)
// ─────────────────────────────────────────────────────────────────────────────

export function addMedicineLog(userId, data) {
  const file = userFile(userId, "medicine_logs.json");
  const logs = readJSON(file, []);
  const entry = { _id: generateId(), userId, ...data, createdAt: new Date().toISOString() };
  logs.push(entry);
  writeJSON(file, logs);
  return entry;
}

export function getLatestMedicineLog(userId) {
  const file = userFile(userId, "medicine_logs.json");
  const logs = readJSON(file, []);
  if (!logs.length) return null;
  return [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

let _counter = 0;
export function generateId() {
  return `${Date.now().toString(36)}${(++_counter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
