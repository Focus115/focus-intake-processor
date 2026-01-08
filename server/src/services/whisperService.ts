import OpenAI from 'openai';
import fs from 'fs';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    // Use default OpenAI SDK configuration without custom agents
    // Railway's network may not work well with custom HTTP agents
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 300000, // 5 minute timeout
      maxRetries: 2, // OpenAI SDK handles retries internally
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

  try {
    console.log('Reading file into buffer...');
    // Read file into buffer instead of streaming
    // Railway may have issues with long-running streams
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = filePath.split('/').pop() || 'audio.mp3';

    console.log(`File loaded: ${fileBuffer.length} bytes, calling OpenAI Whisper API...`);

    // Create a File-like object from buffer
    const file = new File([fileBuffer], fileName, { type: 'audio/mpeg' });

    const transcription = await client.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'text',
    });

    console.log('Transcription successful, length:', transcription.length);
    return transcription;
  } catch (error: any) {
    console.error('OpenAI API error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}
