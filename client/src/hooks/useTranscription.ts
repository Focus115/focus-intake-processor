import { useState, useCallback } from 'react';
import { transcribeAudio, TranscriptionError } from '../services/api';
import { validateAudioFile } from '../utils/fileValidation';

export type TranscriptionStatus = 'idle' | 'uploading' | 'transcribing' | 'processing' | 'complete' | 'error';

export interface UseTranscriptionResult {
  status: TranscriptionStatus;
  uploadProgress: number;
  transcription: string | null;
  formattedIntake: string | null;
  error: string | null;
  fileName: string | null;
  transcribeFile: (file: File) => Promise<void>;
  reset: () => void;
}

export function useTranscription(): UseTranscriptionResult {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [formattedIntake, setFormattedIntake] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setUploadProgress(0);
    setTranscription(null);
    setFormattedIntake(null);
    setError(null);
    setFileName(null);
  }, []);

  const transcribeFile = useCallback(async (file: File) => {
    // Reset previous state
    setError(null);
    setTranscription(null);
    setFormattedIntake(null);
    setFileName(file.name);

    // Validate file
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setStatus('error');
      return;
    }

    try {
      setStatus('uploading');
      setUploadProgress(0);

      const result = await transcribeAudio(file, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setStatus('processing');
        }
      });

      setTranscription(result.transcription);
      setFormattedIntake(result.formattedIntake);
      setStatus('complete');
    } catch (err) {
      if (err instanceof TranscriptionError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setStatus('error');
    }
  }, []);

  return {
    status,
    uploadProgress,
    transcription,
    formattedIntake,
    error,
    fileName,
    transcribeFile,
    reset,
  };
}
