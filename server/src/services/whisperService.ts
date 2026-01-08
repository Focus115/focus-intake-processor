import OpenAI from 'openai';
import fs from 'fs';
import https from 'https';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    // Create HTTPS agent with keep-alive to maintain connections
    // OpenAI API is HTTPS only, so we only need an HTTPS agent
    const httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 60000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 600000, // 10 minute socket timeout
    });

    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 600000, // 10 minute timeout (increased from 5)
      maxRetries: 5, // Increased retries for connection issues
      httpAgent: httpsAgent as any, // OpenAI SDK uses httpAgent for HTTPS too
    });
  }
  return openai;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function transcribeAudio(filePath: string): Promise<string> {
  console.log('Starting transcription for file:', filePath);
  console.log('API key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

  const client = getOpenAIClient();
  const maxRetries = 5;
  let lastError: any;

  // Retry loop with exponential backoff for connection errors
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Calling OpenAI Whisper API... (attempt ${attempt}/${maxRetries})`);

      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        response_format: 'text',
      });

      console.log('Transcription successful, length:', transcription.length);
      return transcription;
    } catch (error: any) {
      lastError = error;
      const isConnectionError =
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Connection error');

      console.error(`OpenAI API error (attempt ${attempt}/${maxRetries}):`, error.message);
      console.error('Error code:', error.code);

      // If it's a connection error and we have retries left, retry with backoff
      if (isConnectionError && attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
        console.log(`Connection error detected. Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
        continue;
      }

      // If it's not a connection error or we're out of retries, throw
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // If we get here, all retries failed
  throw lastError;
}
