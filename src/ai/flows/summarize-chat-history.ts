'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing chat history.
 *
 * - summarizeChatHistory - A function that takes a chat history and returns a concise summary.
 * - ChatHistoryInput - The input type for the summarizeChatHistory function.
 * - ChatSummaryOutput - The return type for the summarizeChatHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatHistoryInputSchema = z.object({
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ).describe('An array of chat messages, including both user inputs and AI responses. Each message has a role (user or model) and its content.'),
});
export type ChatHistoryInput = z.infer<typeof ChatHistoryInputSchema>;

const ChatSummaryOutputSchema = z.string().describe('A concise summarized version of the chat history, capturing key information and context.');
export type ChatSummaryOutput = z.infer<typeof ChatSummaryOutputSchema>;

export async function summarizeChatHistory(input: ChatHistoryInput): Promise<ChatSummaryOutput> {
  return summarizeChatHistoryFlow(input);
}

const summarizeChatHistoryPrompt = ai.definePrompt({
  name: 'summarizeChatHistoryPrompt',
  input: {schema: ChatHistoryInputSchema},
  output: {schema: ChatSummaryOutputSchema},
  prompt: `You are an expert at summarizing conversations. Your task is to summarize the following chat history. Focus on key information, decisions made, and important facts that would be useful for continuing the conversation naturally. The summary should be concise and retain the most critical context.

Chat History:
{{#each chatHistory}}
  {{this.role}}: {{this.content}}
{{/each}}

Please provide a concise summary that captures the essence of the conversation.`,
});

const summarizeChatHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeChatHistoryFlow',
    inputSchema: ChatHistoryInputSchema,
    outputSchema: ChatSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeChatHistoryPrompt(input);
    return output!;
  }
);
