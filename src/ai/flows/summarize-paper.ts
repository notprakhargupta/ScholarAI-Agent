// SummarizePaper flow
'use server';
/**
 * @fileOverview Summarizes a research paper to extract key findings, methods, and conclusions.
 *
 * - summarizePaper - A function that summarizes a research paper.
 * - SummarizePaperInput - The input type for the summarizePaper function.
 * - SummarizePaperOutput - The return type for the summarizePaper function.
 */

import {ai} from '../ai-instance';
import {z} from 'genkit';

const SummarizePaperInputSchema = z.object({
  paperText: z
    .string()
    .describe('The text content of the research paper to be summarized.'),
});
export type SummarizePaperInput = z.infer<typeof SummarizePaperInputSchema>;

const SummarizePaperOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the research paper, including key findings, methods, and conclusions.'
    ),
});
export type SummarizePaperOutput = z.infer<typeof SummarizePaperOutputSchema>;

export async function summarizePaper(input: SummarizePaperInput): Promise<SummarizePaperOutput> {
  return summarizePaperFlow(input);
}

const summarizePaperPrompt = ai.definePrompt({
  name: 'summarizePaperPrompt',
  input: {
    schema: z.object({
      paperText: z
        .string()
        .describe('The text content of the research paper to be summarized.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z
        .string()
        .describe(
          'A concise summary of the research paper, including key findings, methods, and conclusions.'
        ),
    }),
  },
  prompt: `Summarize the following research paper, focusing on the key findings, methods, and conclusions:\n\n{{{paperText}}}`,
});

const summarizePaperFlow = ai.defineFlow<
  typeof SummarizePaperInputSchema,
  typeof SummarizePaperOutputSchema
>({
  name: 'summarizePaperFlow',
  inputSchema: SummarizePaperInputSchema,
  outputSchema: SummarizePaperOutputSchema,
},
async input => {
  const {output} = await summarizePaperPrompt(input);
  return output!;
});
