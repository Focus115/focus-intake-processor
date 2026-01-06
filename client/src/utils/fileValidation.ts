export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
];

export const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac'];

export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAudioFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please use a smaller file.`,
    };
  }

  const isValidType = ALLOWED_AUDIO_TYPES.includes(file.type);
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);

  if (!isValidType && !isValidExtension) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload an MP3, WAV, M4A, WebM, OGG, or FLAC file.',
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
