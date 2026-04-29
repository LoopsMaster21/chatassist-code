'use server';

import { chatbotRespondsWithText } from '@/ai/flows/generate-ai-chat-response';
import { summarizeChatHistory } from '@/ai/flows/summarize-chat-history';
import { aiTextToSpeechOutput } from '@/ai/flows/convert-ai-response-to-speech';
import type { ChatMessage } from '@/lib/types';
import { z } from 'zod';

const MAX_HISTORY_LENGTH = 10;
const HISTORY_TO_SUMMARIZE_THRESHOLD = 4;

export async function handleSendMessage(
  prevState: any,
  formData: FormData
): Promise<{ newMessage: ChatMessage | null; error: string | null }> {
  const schema = z.object({
    prompt: z.string().min(1),
    messages: z.string(),
  });

  const validatedFields = schema.safeParse({
    prompt: formData.get('prompt'),
    messages: formData.get('messages'),
  });

  if (!validatedFields.success) {
    return { newMessage: null, error: 'Invalid input.' };
  }

  const { prompt } = validatedFields.data;
  let history: ChatMessage[];
  try {
    history = JSON.parse(validatedFields.data.messages);
  } catch (error) {
     return { newMessage: null, error: 'Invalid chat history.' };
  }


  let summary: string | null = null;
  let recentHistory = history.filter(msg => !msg.isLoading);

  if (recentHistory.length > MAX_HISTORY_LENGTH) {
    const historyToSummarize = recentHistory.slice(0, -HISTORY_TO_SUMMARIZE_THRESHOLD);
    recentHistory = recentHistory.slice(-HISTORY_TO_SUMMARIZE_THRESHOLD);
    
    try {
      summary = await summarizeChatHistory({
        chatHistory: historyToSummarize.map(({ role, content }) => ({ role, content })),
      });
    } catch (e) {
      console.error('Error summarizing chat history:', e);
      // Fallback to not using summary if it fails
    }
  }

  try {
    const aiResponse = await chatbotRespondsWithText({ 
      query: prompt,
      chatHistory: recentHistory.map(({role, content}) => ({role, content})),
      summary
    });

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      content: aiResponse.textResponse,
    };

    return { newMessage, error: null };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      newMessage: null,
      error: 'Failed to get AI response. Please check your GEMINI_API_KEY and try again.',
    };
  }
}

export async function handleTextToSpeech(
  text: string
): Promise<{ audioDataUri: string | null; error: string | null }> {
  if (!text) {
    return { audioDataUri: null, error: 'No text provided.' };
  }
  try {
    const { audioDataUri } = await aiTextToSpeechOutput({ textToSpeak: text });
    return { audioDataUri, error: null };
  } catch (error) {
    console.error('Error converting text to speech:', error);
    return { audioDataUri: null, error: 'Failed to convert text to speech.' };
  }
}
