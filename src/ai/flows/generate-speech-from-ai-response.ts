'use server';
/**
 * @fileOverview A Genkit flow for converting AI-generated text responses into natural-sounding speech.
 *
 * - generateSpeechFromAIResponse - A function that converts a given text to speech.
 * - GenerateSpeechFromAIResponseInput - The input type for the generateSpeechFromAIResponse function.
 * - GenerateSpeechFromAIResponseOutput - The return type for the generateSpeechFromAIResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as wav from 'wav';

const GenerateSpeechFromAIResponseInputSchema = z.object({
  textToSpeak: z.string().describe('The text to convert to speech.'),
});
export type GenerateSpeechFromAIResponseInput = z.infer<typeof GenerateSpeechFromAIResponseInputSchema>;

const GenerateSpeechFromAIResponseOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a WAV data URI.'),
});
export type GenerateSpeechFromAIResponseOutput = z.infer<typeof GenerateSpeechFromAIResponseOutputSchema>;

export async function generateSpeechFromAIResponse(input: GenerateSpeechFromAIResponseInput): Promise<GenerateSpeechFromAIResponseOutput> {
  return generateSpeechFromAIResponseFlow(input);
}

const generateSpeechFromAIResponseFlow = ai.defineFlow(
  {
    name: 'generateSpeechFromAIResponseFlow',
    inputSchema: GenerateSpeechFromAIResponseInputSchema,
    outputSchema: GenerateSpeechFromAIResponseOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // Placeholder for Spinneys' brand voice
          },
        },
      },
      prompt: input.textToSpeak,
    });

    if (!media) {
      throw new Error('No audio media returned from TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

// Helper function to convert PCM audio buffer to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
