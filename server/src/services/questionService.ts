import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

const QUESTION_SYSTEM_PROMPT = `You are a helpful assistant for a personal training intake system. You have access to the original transcript from a client call and the formatted intake notes that were generated from it.

Your job is to answer clarifying questions about the client or the transcript. You can:
- Clarify details that might be unclear in the formatted notes
- Extract additional information from the transcript that wasn't included
- Help understand context or nuances from the conversation
- Suggest follow-up questions to ask the client

Keep your responses concise and professional. If the information isn't available in the transcript, say so clearly.`;

export interface QuestionContext {
  transcript: string;
  formattedIntake: string;
}

export async function answerQuestion(
  question: string,
  context: QuestionContext
): Promise<string> {
  const client = getOpenAIClient();

  const contextMessage = `Here is the context:

ORIGINAL TRANSCRIPT:
${context.transcript}

FORMATTED INTAKE NOTES:
${context.formattedIntake}

---

User question: ${question}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: QUESTION_SYSTEM_PROMPT },
      { role: 'user', content: contextMessage }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'Unable to answer the question';
}
