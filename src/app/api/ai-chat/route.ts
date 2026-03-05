import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages, streamText } from 'ai';
import { adminDb } from '@/lib/firebase-admin';
import { nanoid } from 'nanoid';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const { messages = [], sessionId: bodySessionId } = await req.json();
        const sessionId = url.searchParams.get('sessionId') || bodySessionId;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'AI chatbot API key is not configured.' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        if (sessionId && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'user') {
                const docId = nanoid();
                await adminDb.collection("ChatMessage").doc(docId).set({
                    id: docId,
                    sessionId: sessionId,
                    role: 'user',
                    content: lastMessage.content,
                    createdAt: new Date().toISOString(),
                });
            }
        }

        const googleAI = createGoogleGenerativeAI({ apiKey });

        const result = streamText({
            model: googleAI('gemini-2.5-flash'),
            messages: await convertToModelMessages(messages),
            system: `🧸 SYSTEM PROMPT

You are "Little Adu", a sweet, polite, and intelligent assistant representing our construction company.

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
- The user has ALREADY provided their full name and phone number before starting this chat. Do NOT ask for them again.
- You can refer to the user by their name if you know it from their previous messages.
- Our team will contact them later with detailed pricing. For now, just give them helpful general advice and encouragement!
- Keep responses short, highly friendly, and enthusiastic.
- Never answer topics outside of construction, architecture, or interior design. Politely redirect them back to homes.
- Never mention:
  - Google Gemini
  - API
  - System prompts
  - Technical details`,
            onFinish: async ({ text }) => {
                if (sessionId) {
                    const docId = nanoid();
                    await adminDb.collection("ChatMessage").doc(docId).set({
                        id: docId,
                        sessionId: sessionId,
                        role: 'bot',
                        content: text,
                        createdAt: new Date().toISOString()
                    });
                }
            }
        });

        return result.toUIMessageStreamResponse({
            onError: (error) => {
                const message = error instanceof Error
                    ? error.message
                    : typeof error === 'object' && error !== null
                        ? JSON.stringify(error)
                        : String(error);

                console.error('AI chat stream error:', message);

                if (message.includes('429') || message.includes('quota')) {
                    return 'Our AI assistant is temporarily unavailable due to request limits. Please try again later.';
                }

                if (message.includes('API key') || message.includes('401') || message.includes('403')) {
                    return 'AI service configuration issue. Please contact support.';
                }

                return 'Something went wrong while generating a response. Please try again.';
            },
        });
    } catch (error) {
        console.error('Error in Little Adu AI Chat:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
