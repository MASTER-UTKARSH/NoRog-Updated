import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, '..', 'firebaseServiceAccount.json');
const dataRoot = path.join(__dirname, '..', 'norog_data');

if (!fs.existsSync(serviceAccountPath)) {
  console.error("ERROR: firebaseServiceAccount.json not found in Backend folder!");
  console.error("Please place the service account JSON there and rerun this script.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

function readJSON(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function migrateData() {
  console.log("Starting NoRog LocalDB -> Firebase Firestore Migration...");
  
  const usersIndexPath = path.join(dataRoot, "users.json");
  const usersIndex = readJSON(usersIndexPath, {});
  const emailKeys = Object.keys(usersIndex);
  
  console.log(`Found ${emailKeys.length} users to migrate.`);
  
  for (const email of emailKeys) {
    const { id: userId } = usersIndex[email];
    console.log(`Migrating user: ${userId} (${email})`);
    
    // 1. Meta (users collection)
    const meta = readJSON(path.join(dataRoot, `user_${userId}`, "meta.json"));
    if (meta) {
      await db.collection("users").doc(userId).set(meta);
    }
    
    // 2. Profile
    const profile = readJSON(path.join(dataRoot, `user_${userId}`, "profile.json"));
    if (profile) {
      await db.collection("profiles").doc(userId).set(profile);
    }
    
    // 3. Insights
    const insights = readJSON(path.join(dataRoot, `user_${userId}`, "insights.json"));
    if (insights) {
      await db.collection("insights").doc(userId).set(insights);
    }
    
    // Helper for arrays
    const migrateArray = async (fileName, collectionName) => {
      const arr = readJSON(path.join(dataRoot, `user_${userId}`, fileName), []);
      let count = 0;
      for (const item of arr) {
        if (!item._id) item._id = db.collection("users").doc(userId).collection(collectionName).doc().id;
        await db.collection("users").doc(userId).collection(collectionName).doc(item._id || item.id).set(item, { merge: true });
        count++;
      }
      return count;
    };
    
    // Arrays to subcollections
    const s = await migrateArray("symptoms.json", "symptoms");
    const p = await migrateArray("predictions.json", "predictions");
    const w = await migrateArray("whatif_logs.json", "whatif_logs");
    const m = await migrateArray("medicine_logs.json", "medicine_logs");
    const f = await migrateArray("family_members.json", "family_members");
    
    // Chat History
    const chatArr = readJSON(path.join(dataRoot, `user_${userId}`, "chat_history.json"), []);
    for (const chat of chatArr) {
      const chatRef = db.collection("users").doc(userId).collection("chat_history").doc();
      await chatRef.set(chat);
    }
    
    console.log(`  -> Migrated ${s} symptoms, ${p} predictions, ${w} whatifs, ${m} med logs, ${f} family members, ${chatArr.length} chats.`);
  }
  
  console.log("Migration completed successfully!");
}

migrateData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
