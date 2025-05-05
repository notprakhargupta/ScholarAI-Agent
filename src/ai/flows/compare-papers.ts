'use server';

/**
 * @fileOverview Compares a list of research papers and provides a comparative analysis.
 *
 * - comparePapers - A function that compares research papers.
 * - ComparePapersInput - The input type for the comparePapers function.
 * - ComparePapersOutput - The return type for the comparePapers function.
 */

import {ai} from '../ai-instance';
import {ArxivPaper} from '../../services/arxiv';
import {z} from 'genkit';

const ComparePapersInputSchema = z.object({
  papers: z.array(
    z.object({
      title: z.string().describe('The title of the paper.'),
      abstract: z.string().describe('The abstract of the paper.'),
      url: z.string().describe('The URL of the paper.'),
      authors: z.array(z.string()).describe('Authors of the paper.'),
      published: z.string().describe('Publication date of the paper.'),
    })
  ).describe('A list of research papers to compare.'),
  topic: z.string().describe('The research topic to focus the comparison on.'),
});
export type ComparePapersInput = z.infer<typeof ComparePapersInputSchema>;

const ComparePapersOutputSchema = z.object({
  analysis: z.string().describe('A comparative analysis of the research papers.'),
});
export type ComparePapersOutput = z.infer<typeof ComparePapersOutputSchema>;

export async function comparePapers(input: ComparePapersInput): Promise<ComparePapersOutput> {
  return comparePapersFlow(input);
}

const comparePapersPrompt = ai.definePrompt({
  name: 'comparePapersPrompt',
  input: {
    schema: z.object({
      papers: z.array(
        z.object({
          title: z.string().describe('The title of the paper.'),
          abstract: z.string().describe('The abstract of the paper.'),
          url: z.string().describe('The URL of the paper.'),
          authors: z.array(z.string()).describe('Authors of the paper.'),
          published: z.string().describe('Publication date of the paper.'),
        })
      ).describe('A list of research papers to compare.'),
      topic: z.string().describe('The research topic to focus the comparison on.'),
    }),
  },
  output: {
    schema: z.object({
      analysis: z.string().describe('A comparative analysis of the research papers.'),
    }),
  },
  prompt: `You are an expert research assistant. Your task is to compare and contrast a list of research papers on the topic of {{topic}}.  Identify the similarities, differences, and potential conflicts between the papers. Focus on key methods, performance benchmarks, and open research questions. Provide a concise and informative analysis.

Papers:
{{#each papers}}
Title: {{this.title}}
Authors: {{this.authors}}
Abstract: {{this.abstract}}
URL: {{this.url}}
Published: {{this.published}}
\n
{{/each}}`,
});

const comparePapersFlow = ai.defineFlow<
  typeof ComparePapersInputSchema,
  typeof ComparePapersOutputSchema
>(
  {
    name: 'comparePapersFlow',
    inputSchema: ComparePapersInputSchema,
    outputSchema: ComparePapersOutputSchema,
  },
  async input => {
    const {output} = await comparePapersPrompt(input);
    return output!;
  }
);
