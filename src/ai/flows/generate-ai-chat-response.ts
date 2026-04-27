'use server';
/**
 * @fileOverview An AI chat response generator that uses Gemini Flash 2.0.
 *
 * - generateAiChatResponse - A function that handles generating AI chat responses.
 * - GenerateAiChatResponseInput - The input type for the generateAiChatResponse function.
 * - GenerateAiChatResponseOutput - The return type for the generateAiChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiChatResponseInputSchema = z.object({
  prompt: z.string().describe('The user\'s chat message or question.'),
});
export type GenerateAiChatResponseInput = z.infer<typeof GenerateAiChatResponseInputSchema>;

const GenerateAiChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI\'s generated response.'),
});
export type GenerateAiChatResponseOutput = z.infer<typeof GenerateAiChatResponseOutputSchema>;

export async function generateAiChatResponse(
  input: GenerateAiChatResponseInput
): Promise<GenerateAiChatResponseOutput> {
  return generateAiChatResponseFlow(input);
}

const generateAiChatResponsePrompt = ai.definePrompt({
  name: 'generateAiChatResponsePrompt',
  input: {schema: GenerateAiChatResponseInputSchema},
  output: {schema: GenerateAiChatResponseOutputSchema},
  prompt: `You are a helpful AI assistant. Please provide a relevant and concise response to the user's prompt.

User's prompt: {{{prompt}}}`,
});

const generateAiChatResponseFlow = ai.defineFlow(
  {
    name: 'generateAiChatResponseFlow',
    inputSchema: GenerateAiChatResponseInputSchema,
    outputSchema: GenerateAiChatResponseOutputSchema,
  },
  async input => {
    const {output} = await generateAiChatResponsePrompt(input);
    return output!;
  }
);
