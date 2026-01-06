import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import transcribeRouter from './routes/transcribe';
import questionRouter from './routes/question';
import { errorHandler } from './middleware/errorHandler';

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
