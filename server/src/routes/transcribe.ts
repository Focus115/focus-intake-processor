import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { upload } from '../middleware/fileUpload';
import { transcribeAudio } from '../services/whisperService';
import { processIntake } from '../services/intakeProcessor';

const router = Router();

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

      // Clean up the uploaded file
      fs.unlink(file.path, (err) => {
        if (err) console.error('Failed to delete temp file:', err);
      });

      // Step 2: Process transcription into intake format with GPT-4o
      const formattedIntake = await processIntake(transcription);

      res.json({
        transcription,
        formattedIntake
      });
    } catch (error) {
      // Clean up file on error too
      fs.unlink(file.path, () => {});
      next(error);
    }
  }
);

export default router;
