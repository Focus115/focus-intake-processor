import OpenAI from 'openai';
import fs from 'fs';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 120000, // 2 minute timeout - sufficient for most audio files
      maxRetries: 0, // No retries - Render has stable connection to OpenAI
    });
  }
  return openai;
}

export async function transcribeAudio(filePath: string): Promise<string> {
  console.log('Starting transcription for file:', filePath);

  const client = getOpenAIClient();

  try {
    console.log('Calling OpenAI Whisper API...');

    // Use file streaming - more efficient than loading into memory
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'text',
    });

    console.log('Transcription successful, length:', transcription.length);
    return transcription;
  } catch (error: any) {
    console.error('OpenAI API error:', error.message);
    console.error('Error code:', error.code);
    throw error;
  }
}
