import OpenAI from 'openai';
import fs from 'fs';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 300000, // 5 minute timeout
      maxRetries: 3,
    });
  }
  return openai;
}

export async function transcribeAudio(filePath: string): Promise<string> {
  console.log('Starting transcription for file:', filePath);
  console.log('API key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

  const client = getOpenAIClient();

  try {
    console.log('Calling OpenAI Whisper API...');
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'text',
    });
    console.log('Transcription successful, length:', transcription.length);
    return transcription;
  } catch (error: any) {
    console.error('OpenAI API error:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}
