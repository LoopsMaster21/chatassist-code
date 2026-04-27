import { config } from 'dotenv';
config();

import '@/ai/flows/convert-ai-response-to-speech.ts';
import '@/ai/flows/generate-ai-chat-response.ts';
import '@/ai/flows/summarize-chat-history.ts';
import '@/ai/flows/summarize-chat-context.ts';
import '@/ai/flows/generate-speech-from-ai-response.ts';
import '@/ai/flows/receive-ai-response.ts';