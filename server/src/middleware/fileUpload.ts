import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper API limit)
const MAX_FILE_AGE_MS = 5 * 60 * 1000; // 5 minutes - files older than this are orphaned

const uploadDir = '/tmp/transcription-uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Clean up any orphaned files in the upload directory
 * Called on server startup and periodically to ensure no files remain
 */
export function cleanupOrphanedFiles(): void {
  try {
    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      try {
        const stats = fs.statSync(filePath);
        // Delete files older than MAX_FILE_AGE_MS
        if (now - stats.mtimeMs > MAX_FILE_AGE_MS) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch (err) {
        // File may have been deleted already, ignore
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} orphaned file(s) from upload directory`);
    }
  } catch (err) {
    console.error('Error cleaning up orphaned files:', err);
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
