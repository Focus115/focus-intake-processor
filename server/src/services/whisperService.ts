import OpenAI from 'openai';
import fs from 'fs';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function transcribeAudio(filePath: string): Promise<string> {
  const client = getOpenAIClient();
  const transcription = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    response_format: 'text',
  });

  return transcription;
}
