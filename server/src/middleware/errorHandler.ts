import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  message: string;
  code: string;
  retryable: boolean;
}

export function errorHandler(
  err: Error & { status?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      message: 'File size exceeds 25MB limit',
      code: 'FILE_TOO_LARGE',
      retryable: false,
    } as ErrorResponse);
    return;
  }

  // Multer file type error
  if (err.message.includes('Invalid file type')) {
    res.status(400).json({
      message: err.message,
      code: 'INVALID_FILE_TYPE',
      retryable: false,
    } as ErrorResponse);
    return;
  }

  // OpenAI rate limit
  if (err.status === 429) {
    res.status(429).json({
      message: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMITED',
      retryable: true,
    } as ErrorResponse);
    return;
  }

  // OpenAI auth error
  if (err.status === 401) {
    res.status(500).json({
      message: 'Server configuration error. Please contact support.',
      code: 'API_KEY_ERROR',
      retryable: false,
    } as ErrorResponse);
    return;
  }

  // Default error
  res.status(500).json({
    message: 'An unexpected error occurred. Please try again.',
    code: 'INTERNAL_ERROR',
    retryable: true,
  } as ErrorResponse);
}
