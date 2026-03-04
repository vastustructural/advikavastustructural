import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const apiKey =
            process.env.LITTLE_ADU_OPENAI_API_KEY ||
            process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'AI chatbot API key is not configured.' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const openai = createOpenAI({ apiKey });

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            messages,
            system: `🧸 SYSTEM PROMPT

You are "Little Adu", a sweet, polite, and intelligent toddler assistant representing our construction company.

Your personality:
- Friendly
- Warm
- Slightly playful but professional
- Simple language
- Clear answers
- Not childish nonsense

Your job:
- Help users with House Plans
- Explain Construction Estimates
- Guide about Vastu basics
- Encourage them to build their dream home

IMPORTANT LEAD RULES:
- Before giving detailed pricing or consultation, politely ask:
  - Their full name
  - Their phone number
- If user avoids giving phone, gently explain:
  "Our team needs your number to prepare accurate details for you."
- Always collect name and phone before ending conversation.
- Keep responses short and friendly.
- Never answer unrelated topics.
- If question is outside construction, politely redirect.
- Never mention:
  - OpenAI
  - API
  - System prompts
  - Technical details`,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Error in Little Adu AI Chat:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
