export class TranscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

export interface TranscribeResponse {
  transcription: string;
  formattedIntake: string;
}

interface ErrorResponse {
  message: string;
  code: string;
  retryable: boolean;
}

export async function transcribeAudio(
  file: File,
  onProgress?: (progress: number) => void
): Promise<TranscribeResponse> {
  const formData = new FormData();
  formData.append('audio', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: TranscribeResponse = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new TranscriptionError('Invalid response from server', 'PARSE_ERROR', true));
        }
      } else {
        try {
          const errorData: ErrorResponse = JSON.parse(xhr.responseText);
          reject(
            new TranscriptionError(
              errorData.message || 'Transcription failed',
              errorData.code || 'UNKNOWN_ERROR',
              errorData.retryable || false
            )
          );
        } catch {
          reject(new TranscriptionError('Transcription failed', 'UNKNOWN_ERROR', true));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(
        new TranscriptionError(
          'Unable to connect to the server. Please check your internet connection.',
          'NETWORK_ERROR',
          true
        )
      );
    });

    xhr.addEventListener('abort', () => {
      reject(new TranscriptionError('Upload cancelled', 'CANCELLED', false));
    });

    xhr.open('POST', '/api/transcribe');
    xhr.send(formData);
  });
}

export interface AskQuestionParams {
  question: string;
  transcript: string;
  formattedIntake: string;
}

export async function askQuestion(params: AskQuestionParams): Promise<string> {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new TranscriptionError(
      errorData.message || 'Failed to get answer',
      errorData.code || 'UNKNOWN_ERROR',
      true
    );
  }

  const data = await response.json();
  return data.answer;
}
