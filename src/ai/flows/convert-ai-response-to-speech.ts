'use server';


import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as wav from 'wav';

const AiTextToSpeechOutputInputSchema = z.object({
  textToSpeak: z.string().describe('The text to convert to speech.'),
});
export type AiTextToSpeechOutputInput = z.infer<typeof AiTextToSpeechOutputInputSchema>;

const AiTextToSpeechOutputOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a WAV data URI.'),
});
export type AiTextToSpeechOutputOutput = z.infer<typeof AiTextToSpeechOutputOutputSchema>;

export async function aiTextToSpeechOutput(input: AiTextToSpeechOutputInput): Promise<AiTextToSpeechOutputOutput> {
  return aiTextToSpeechOutputFlow(input);
}

const aiTextToSpeechOutputFlow = ai.defineFlow(
  {
    name: 'aiTextToSpeechOutputFlow',
    inputSchema: AiTextToSpeechOutputInputSchema,
    outputSchema: AiTextToSpeechOutputOutputSchema,
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
 