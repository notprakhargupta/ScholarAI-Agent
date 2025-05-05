'use server';

/**
 * @fileOverview An AI agent that retrieves and summarizes relevant research papers from arXiv based on a user-provided topic.
 *
 * - findRelevantPapers - A function that searches arXiv, summarizes the found papers and returns them.
 * - FindRelevantPapersInput - The input type for the findRelevantPapers function.
 * - FindRelevantPapersOutput - The return type for the findRelevantPapers function.
 */

import {ai} from '../ai-instance';
import {z} from 'genkit';
import {searchArxiv, ArxivPaper} from '../../services/arxiv';

const FindRelevantPapersInputSchema = z.object({
  topic: z.string().describe('The research topic to search for on arXiv.'),
});
export type FindRelevantPapersInput = z.infer<typeof FindRelevantPapersInputSchema>;

const FindRelevantPapersOutputSchema = z.array(z.object({
  title: z.string().describe('The title of the paper.'),
  abstract: z.string().describe('A short summary of the paper.'),
  url: z.string().describe('The URL of the paper on arXiv.'),
  authors: z.array(z.string()).describe('The authors of the paper.'),
  published: z.string().describe('The publication date of the paper.'),
  summary: z.string().describe('A detailed summary of the paper.'),
}));
export type FindRelevantPapersOutput = z.infer<typeof FindRelevantPapersOutputSchema>;

export async function findRelevantPapers(input: FindRelevantPapersInput): Promise<FindRelevantPapersOutput> {
  return findRelevantPapersFlow(input);
}

const summarizePaper = ai.definePrompt({
  name: 'summarizePaper',
  input: {
    schema: z.object({
      title: z.string().describe('The title of the paper.'),
      abstract: z.string().describe('The abstract of the paper.'),
      url: z.string().describe('The URL of the paper on arXiv.'),
      authors: z.array(z.string()).describe('The authors of the paper.'),
      published: z.string().describe('The publication date of the paper.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A detailed summary of the paper.'),
    }),
  },
  prompt: `Summarize the following research paper, focusing on the key findings and contributions:\n\nTitle: {{{title}}}\nAbstract: {{{abstract}}}\nURL: {{{url}}}\nAuthors: {{#each authors}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\nPublished: {{{published}}}`, // Handlebars syntax
});

const findRelevantPapersFlow = ai.defineFlow<
  typeof FindRelevantPapersInputSchema,
  typeof FindRelevantPapersOutputSchema
>({
  name: 'findRelevantPapersFlow',
  inputSchema: FindRelevantPapersInputSchema,
  outputSchema: FindRelevantPapersOutputSchema,
}, async (input) => {
  const papers = await searchArxiv(input.topic);

  const summarizedPapers = await Promise.all(
    papers.map(async (paper) => {
      const {output} = await summarizePaper(paper);
      return {
        ...paper,
        summary: output!.summary,
      };
    })
  );

  return summarizedPapers;
});
