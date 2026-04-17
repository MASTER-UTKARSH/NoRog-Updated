import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OFFLINE_DATA_DIR = path.join(__dirname, "..", "offline_data");

// Ensure base offline directory exists
if (!fs.existsSync(OFFLINE_DATA_DIR)) {
  fs.mkdirSync(OFFLINE_DATA_DIR, { recursive: true });
}

/**
 * Saves user data locally to a folder dedicated to that user.
 * @param {string} userId - The user's unique ID.
 * @param {string} category - The type of data (profile, symptoms, predictions, etc.)
 * @param {object} data - The data to store.
 */
export const saveUserDataOffline = (userId, category, data) => {
  try {
    if (!userId) return;

    const userDir = path.join(OFFLINE_DATA_DIR, `user_${userId}`);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const filePath = path.join(userDir, `${category}.json`);
    
    // For historical data like symptoms, predictions, etc., we append to an array
    const historicalCategories = ["symptoms", "predictions", "medicines", "whatif"];
    
    if (historicalCategories.includes(category)) {
      let existingData = [];
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          existingData = JSON.parse(content);
          if (!Array.isArray(existingData)) existingData = [existingData];
        } catch (e) {
          existingData = [];
        }
      }
      
      const newData = {
        ...data,
        _offline_timestamp: new Date().toISOString()
      };
      
      existingData.push(newData);
      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    } else {
      // For single-state data like profile or user info, we overwrite with the latest
      const newData = {
        ...(data.toObject ? data.toObject() : data),
        _offline_timestamp: new Date().toISOString()
      };
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
    }
    
    console.log(`[OfflineStorage] Successfully saved ${category} for user ${userId}`);
  } catch (error) {
    console.error(`[OfflineStorage] Failed to save ${category} for user ${userId}:`, error.message);
  }
};

export default { saveUserDataOffline };
