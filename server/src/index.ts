import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import transcribeRouter from './routes/transcribe';
import questionRouter from './routes/question';
import { errorHandler } from './middleware/errorHandler';
import { cleanupOrphanedFiles } from './middleware/fileUpload';

dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY environment variable is required');
  console.error('Please create a .env file with your OpenAI API key');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Clean up any orphaned files on startup
cleanupOrphanedFiles();

// Run cleanup every 5 minutes to catch any orphaned files
setInterval(cleanupOrphanedFiles, 5 * 60 * 1000);

// Security headers
app.use((_req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict transport security (HTTPS only)
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Don't leak referrer info
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS configuration
app.use(
  cors({
    origin: isProduction
      ? process.env.ALLOWED_ORIGINS?.split(',') || true
      : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Transcription routes
app.use('/api', transcribeRouter);

// Question routes
app.use('/api', questionRouter);

// Serve static files in production
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
