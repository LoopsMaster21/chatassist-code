'use server';

import { generateAiChatResponse } from '@/ai/flows/generate-ai-chat-response';
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


  let finalPrompt = '';
  const conversationHistoryForPrompt = history
    .filter(msg => !msg.isLoading)
    .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`);

  if (history.length > MAX_HISTORY_LENGTH) {
    const historyToSummarize = history.slice(0, -HISTORY_TO_SUMMARIZE_THRESHOLD);
    
    try {
      const summary = await summarizeChatHistory({
        chatHistory: historyToSummarize.map(({ role, content }) => ({ role, content })),
      });
      conversationHistoryForPrompt.unshift(`Summary of the conversation so far: ${summary}`);

    } catch (e) {
      console.error('Error summarizing chat history:', e);
      // Fallback to simpler history if summarization fails
    }
  }
  
  finalPrompt = conversationHistoryForPrompt.join('\n');

  try {
    const aiResponse = await generateAiChatResponse({ prompt: finalPrompt });

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      content: aiResponse.response,
    };

    return { newMessage, error: null };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      newMessage: null,
      error: 'Failed to get AI response. Please try again.',
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
