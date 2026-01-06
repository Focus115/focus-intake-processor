import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { upload } from '../middleware/fileUpload';
import { transcribeAudio } from '../services/whisperService';
import { processIntake } from '../services/intakeProcessor';

const router = Router();

/**
 * Securely delete a file and verify it's gone
 */
function secureDeleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      // Verify deletion
      if (fs.existsSync(filePath)) {
        console.error('SECURITY WARNING: File still exists after deletion attempt:', filePath);
      }
    }
  } catch (err) {
    console.error('Failed to delete file:', filePath, err);
  }
}

router.post(
  '/transcribe',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        message: 'No audio file provided',
        code: 'NO_FILE',
        retryable: false,
      });
      return;
    }

    try {
      // Step 1: Transcribe audio with Whisper
      const transcription = await transcribeAudio(file.path);

      // Immediately delete the audio file after transcription (before any further processing)
      secureDeleteFile(file.path);

      // Step 2: Process transcription into intake format with GPT-4o
      const formattedIntake = await processIntake(transcription);

      res.json({
        transcription,
        formattedIntake
      });
    } catch (error) {
      // Clean up file on error too
      secureDeleteFile(file.path);
      next(error);
    }
  }
);

export default router;
