import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads/logos");

export const ensureUploadsDir = (): void => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

export const saveBase64Image = (base64Data: string, fileName: string): string => {
  ensureUploadsDir();

  // Remove the data URL prefix (e.g., "data:image/png;base64,")
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Image, "base64");
  const filePath = path.join(UPLOADS_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  // Return the public URL path
  return `/uploads/logos/${fileName}`;
};