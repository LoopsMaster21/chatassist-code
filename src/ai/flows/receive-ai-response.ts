'use server';


import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReceiveAiResponseInputSchema = z.object({
  prompt: z.string().describe('The user\'s chat message or question.'),
});
export type ReceiveAiResponseInput = z.infer<typeof ReceiveAiResponseInputSchema>;

const ReceiveAiResponseOutputSchema = z.object({
  response: z.string().describe('The AI\'s generated response.'),
});
export type ReceiveAiResponseOutput = z.infer<typeof ReceiveAiResponseOutputSchema>;

export async function receiveAiResponse(
  input: ReceiveAiResponseInput
): Promise<ReceiveAiResponseOutput> {
  return receiveAiResponseFlow(input);
}

const receiveAiResponsePrompt = ai.definePrompt({
  name: 'receiveAiResponsePrompt',
  input: { schema: ReceiveAiResponseInputSchema },
  output: { schema: ReceiveAiResponseOutputSchema },
  prompt: `You are an intelligent AI assistant named ChatAssist, specializing in helping users with their queries. Provide a concise, helpful, and relevant response to the user's prompt.

User's prompt: {{{prompt}}}`,
});

const receiveAiResponseFlow = ai.defineFlow(
  {
    name: 'receiveAiResponseFlow',
    inputSchema: ReceiveAiResponseInputSchema,
    outputSchema: ReceiveAiResponseOutputSchema,
  },
  async (input) => {
    const { output } = await receiveAiResponsePrompt(input);
    return output!;
  }
);
 