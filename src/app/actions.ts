// src/app/actions.ts
'use server';

import { findRelevantPapers, FindRelevantPapersInput, FindRelevantPapersOutput } from '../ai/flows/find-relevant-papers';
import { comparePapers, ComparePapersInput, ComparePapersOutput } from '../ai/flows/compare-papers';
import type { ArxivPaper } from '../services/arxiv';
import { z } from 'zod';

const SearchSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }),
});

const CompareSchema = z.object({
  topic: z.string(),
  papers: z.array(z.object({
    title: z.string(),
    abstract: z.string(),
    url: z.string(),
    authors: z.array(z.string()),
    published: z.string(),
    summary: z.string().optional(), // Keep summary optional here as comparePapers doesn't strictly need it
  })).min(2, { message: "Please select at least two papers to compare." }),
});

export type SearchState = {
  message?: string | null;
  errors?: {
    topic?: string[];
  };
  papers?: FindRelevantPapersOutput;
  comparison?: ComparePapersOutput;
  searchTopic?: string;
};

export async function searchPapersAction(
  prevState: SearchState | null,
  formData: FormData,
): Promise<SearchState> {
  const validatedFields = SearchSchema.safeParse({
    topic: formData.get('topic'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid search topic.',
      papers: prevState?.papers,
      comparison: prevState?.comparison,
      searchTopic: prevState?.searchTopic,
    };
  }

  const { topic } = validatedFields.data;

  try {
    console.log(`Searching papers for topic: ${topic}`);
    const papers = await findRelevantPapers({ topic });
    console.log(`Found ${papers.length} papers.`);
    return {
      message: `Found ${papers.length} papers related to "${topic}".`,
      papers: papers,
      searchTopic: topic,
      comparison: undefined, // Clear previous comparison
    };
  } catch (error) {
    console.error("Error searching papers:", error);
    return {
      message: 'Failed to search for papers. Please try again.',
      errors: {},
      papers: prevState?.papers,
      searchTopic: topic,
      comparison: prevState?.comparison,
    };
  }
}

export async function comparePapersAction(
  prevState: SearchState | null,
  formData: FormData,
): Promise<SearchState> {
  if (!prevState?.papers || prevState.papers.length === 0) {
    return { ...prevState, message: 'No papers available to compare. Please search first.' };
  }

  const selectedIndices = formData.getAll('selectedPapers').map(Number);
  const selectedPapers = selectedIndices
    .map(index => prevState.papers?.[index])
    .filter((p): p is ArxivPaper => p !== undefined); // Ensure p is not undefined and type narrow

  const validatedFields = CompareSchema.safeParse({
      topic: prevState.searchTopic || "Selected Papers", // Use search topic or a default
      papers: selectedPapers,
  });


  if (!validatedFields.success) {
    return {
      ...prevState,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid comparison request.',
    };
  }

   if (selectedPapers.length < 2) {
     return {
       ...prevState,
        message: 'Please select at least two papers to compare.',
        errors: { papers: ['Please select at least two papers to compare.'] },
     };
   }

  const { topic, papers: papersToCompare } = validatedFields.data;

  // Construct the input for the comparePapers Genkit flow
  const comparisonInput: ComparePapersInput = {
    topic: topic,
    // Map selected papers to the format expected by comparePapers
    // Note: comparePapers expects `ArxivPaper`, which doesn't include `summary`.
    // We can just pass the core ArxivPaper fields.
    papers: papersToCompare.map(p => ({
        title: p.title,
        abstract: p.abstract,
        url: p.url,
        authors: p.authors,
        published: p.published,
    }))
  };


  try {
    console.log(`Comparing ${papersToCompare.length} papers on topic: ${topic}`);
    const comparisonResult = await comparePapers(comparisonInput);
    console.log("Comparison successful.");
    return {
        ...prevState, // Keep previous papers
        message: 'Comparison complete.',
        comparison: comparisonResult, // Add comparison result
        errors: {}, // Clear errors
    };
  } catch (error) {
    console.error("Error comparing papers:", error);
    return {
      ...prevState,
      message: 'Failed to compare papers. Please try again.',
      errors: {},
    };
  }
}
