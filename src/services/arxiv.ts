/**
 * Represents a paper found on arXiv.
 */
export interface ArxivPaper {
  /**
   * The title of the paper.
   */
  title: string;
  /**
   * The abstract of the paper.
   */
  abstract: string;
  /**
   * The URL of the paper.
   */
  url: string;
  /**
   * Authors of the paper.
   */
  authors: string[];

  /**
   * Publication date of the paper.
   */
  published: string;
}

/**
 * Asynchronously searches arXiv for papers related to a given topic.
 *
 * @param topic The topic to search for.
 * @returns A promise that resolves to an array of ArxivPaper objects.
 */
export async function searchArxiv(topic: string): Promise<ArxivPaper[]> {
  // TODO: Implement this by calling the arXiv API.

  return [
    {
      title: 'Sample Paper 1',
      abstract: 'This is a sample abstract for paper 1.',
      url: 'http://example.com/paper1',
      authors: ['John Doe', 'Jane Smith'],
      published: '2024-01-01',
    },
    {
      title: 'Sample Paper 2',
      abstract: 'This is a sample abstract for paper 2.',
      url: 'http://example.com/paper2',
      authors: ['Alice Johnson', 'Bob Williams'],
      published: '2024-02-15',
    },
  ];
}
