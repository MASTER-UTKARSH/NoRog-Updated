import fs from "fs";
import path from "path";

/**
 * Convert an uploaded image file to a base64 data URI string.
 * @param {string} filePath - Path to the uploaded file
 * @returns {string} Base64 data URI 
 */
export const imageToBase64 = (filePath) => {
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const mimeType = ext === "jpg" ? "jpeg" : ext;
  const buffer = fs.readFileSync(filePath);
  return `data:image/${mimeType};base64,${buffer.toString("base64")}`;
};

/**
 * Clean up uploaded temp file.
 */
export const deleteUploadedFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn("Failed to delete temp file:", err.message);
  }
};
