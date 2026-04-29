'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeChatContextInputSchema = z.object({
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ).describe('An array of chat messages, including both user inputs and AI responses. Each message has a role (user or model) and its content.'),
});
export type SummarizeChatContextInput = z.infer<typeof SummarizeChatContextInputSchema>;

const SummarizeChatContextOutputSchema = z.string().describe('A concise summary of the chat history, optimized for retaining context for future AI responses.');
export type SummarizeChatContextOutput = z.infer<typeof SummarizeChatContextOutputSchema>;

export async function summarizeChatContext(input: SummarizeChatContextInput): Promise<SummarizeChatContextOutput> {
  return summarizeChatContextFlow(input);
}

const summarizeChatContextPrompt = ai.definePrompt({
  name: 'summarizeChatContextPrompt',
  input: {schema: SummarizeChatContextInputSchema},
  output: {schema: SummarizeChatContextOutputSchema},
  prompt: `You are an expert at summarizing conversations, specifically for retaining context in an ongoing AI assistant conversation. Your task is to summarize the following chat history. The summary should be concise, capturing all key information, decisions, and crucial context points that an AI assistant would need to maintain a relevant conversation without losing track of previous interactions. This summary will be used to inform subsequent AI responses.

Chat History:
{{#each chatHistory}}
  {{this.role}}: {{this.content}}
{{/each}}

Provide a concise summary that will help an AI assistant understand the current state and important aspects of this conversation for its next response.`,
});

const summarizeChatContextFlow = ai.defineFlow(
  {
    name: 'summarizeChatContextFlow',
    inputSchema: SummarizeChatContextInputSchema,
    outputSchema: SummarizeChatContextOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeChatContextPrompt(input);
    return output!;
  }
);
 