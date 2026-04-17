import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, '..', 'firebaseServiceAccount.json');

let db = null;
try {
  let serviceAccount = null;

  // Try reading from environment variable first (for Render/Production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("Initializing Firebase via environment variable...");
  } 
  // Fallback to local file
  else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log("Initializing Firebase via service account JSON file...");
  }

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log("Firebase initialized successfully");
  } else {
    console.warn("WARNING: Firebase credentials NOT found! (Checked FIREBASE_SERVICE_ACCOUNT env and firebaseServiceAccount.json)");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Helper to handle the case where DB is not initialized yet
const checkDB = () => {
  if (!db) throw new Error("Firebase DB not initialized. Missing service account JSON.");
  return db;
};

// ─────────────────────────────────────────────────────────────────────────────
// USER OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function createUser({ id, name, email, password }) {
  const db = checkDB();
  const meta = { id, name, email: email.toLowerCase(), password, createdAt: new Date().toISOString() };
  await db.collection("users").doc(id).set(meta);
  return meta;
}

export async function findUserByEmail(email) {
  const db = checkDB();
  const snapshot = await db.collection("users").where("email", "==", email.toLowerCase()).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

export async function findUserById(id) {
  const db = checkDB();
  const doc = await db.collection("users").doc(id).get();
  if (!doc.exists) return null;
  return doc.data();
}

export async function updateUser(id, updates) {
  const db = checkDB();
  const docRef = db.collection("users").doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  
  const updated = { ...doc.data(), ...updates, id }; // always keep id
  await docRef.set(updated, { merge: true });
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH PROFILE
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

export async function getProfile(userId) {
  const db = checkDB();
  const doc = await db.collection("profiles").doc(userId).get();
  if (!doc.exists) return { ...DEFAULT_PROFILE, userId };
  return { ...DEFAULT_PROFILE, ...doc.data() };
}

export async function saveProfile(userId, data) {
  const db = checkDB();
  const existing = await getProfile(userId);
  const updated = { ...existing, ...data, userId, updatedAt: new Date().toISOString() };
  await db.collection("profiles").doc(userId).set(updated, { merge: true });
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYMPTOM LOGS
// ─────────────────────────────────────────────────────────────────────────────

export async function addSymptomLog(userId, log) {
  const db = checkDB();
  const ref = db.collection("users").doc(userId).collection("symptoms").doc();
  const entry = {
    _id: ref.id,
    userId,
    ...log,
    createdAt: new Date().toISOString()
  };
  await ref.set(entry);
  return entry;
}

export async function getSymptomLogs(userId, limit = 50) {
  const db = checkDB();
  const snapshot = await db.collection("users").doc(userId).collection("symptoms")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map(doc => doc.data());
}

export async function updateSymptomLog(userId, logId, updates) {
  const db = checkDB();
  const ref = db.collection("users").doc(userId).collection("symptoms").doc(logId);
  const doc = await ref.get();
  if (!doc.exists) return null;
  await ref.update(updates);
  return { ...doc.data(), ...updates };
}

// ─────────────────────────────────────────────────────────────────────────────
// PREDICTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function addPrediction(userId, data) {
  const db = checkDB();
  const ref = db.collection("users").doc(userId).collection("predictions").doc();
  const entry = { _id: ref.id, userId, ...data, createdAt: new Date().toISOString() };
  await ref.set(entry);
  return entry;
}

export async function getLatestPrediction(userId) {
  const db = checkDB();
  const snapshot = await db.collection("users").doc(userId).collection("predictions")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT-IF LOGS
// ─────────────────────────────────────────────────────────────────────────────

export async function addWhatIfLog(userId, data) {
  const db = checkDB();
  const ref = db.collection("users").doc(userId).collection("whatif_logs").doc();
  const entry = { _id: ref.id, userId, ...data, createdAt: new Date().toISOString() };
  await ref.set(entry);
  return entry;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDICINE LOGS
// ─────────────────────────────────────────────────────────────────────────────

export async function addMedicineLog(userId, data) {
  const db = checkDB();
  const ref = db.collection("users").doc(userId).collection("medicine_logs").doc();
  const entry = { _id: ref.id, userId, ...data, createdAt: new Date().toISOString() };
  await ref.set(entry);
  return entry;
}

export async function getLatestMedicineLog(userId) {
  const db = checkDB();
  const snapshot = await db.collection("users").doc(userId).collection("medicine_logs")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT HISTORY
// ─────────────────────────────────────────────────────────────────────────────

export async function getChatHistory(userId, limit = 50) {
  const db = checkDB();
  const snapshot = await db.collection("users").doc(userId).collection("chat_history")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map(doc => doc.data()).reverse(); // Reverse back to chronological order
}

export async function addToChatHistory(userId, message) {
  const db = checkDB();
  const ref = db.collection("users").doc(userId).collection("chat_history").doc();
  const entry = {
    ...message,
    timestamp: new Date().toISOString()
  };
  await ref.set(entry);
  return entry;
}

export async function clearChatHistory(userId) {
  const db = checkDB();
  const batch = db.batch();
  const snapshot = await db.collection("users").doc(userId).collection("chat_history").get();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHTS & PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_INSIGHTS = {
  mood: [],
  habits: [],
  patterns: [],
  stress_triggers: [],
  goals: [],
  behavioral_changes: []
};

export async function getInsights(userId) {
  const db = checkDB();
  const doc = await db.collection("insights").doc(userId).get();
  if (!doc.exists) return DEFAULT_INSIGHTS;
  return { ...DEFAULT_INSIGHTS, ...doc.data() };
}

export async function updateInsights(userId, updates) {
  const db = checkDB();
  const existing = await getInsights(userId);
  const updated = { ...existing };
  
  Object.keys(updates).forEach(key => {
    updated[key] = updates[key]; // Assume proper array overwriting/merging is done by caller
  });

  await db.collection("insights").doc(userId).set(updated, { merge: true });
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAMILY MEMBERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getFamilyMembers(userId) {
  const db = checkDB();
  const snapshot = await db.collection("users").doc(userId).collection("family_members").get();
  return snapshot.docs.map(doc => doc.data());
}

export async function addOrUpdateFamilyMember(userId, member) {
  const db = checkDB();
  const collectionRef = db.collection("users").doc(userId).collection("family_members");
  
  // Find if exists
  const snapshot = await collectionRef.get();
  const existing = snapshot.docs.find(doc => {
    const d = doc.data();
    return d.id === member.id || (d.name === member.name && d.relation === member.relation);
  });
  
  let ref;
  let dataToSave;
  
  if (existing) {
    ref = existing.ref;
    dataToSave = { ...existing.data(), ...member };
  } else {
    ref = collectionRef.doc();
    dataToSave = { id: member.id || ref.id, ...member };
  }
  
  await ref.set(dataToSave, { merge: true });
  return dataToSave;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
