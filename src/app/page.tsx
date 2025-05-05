'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { searchPapersAction, comparePapersAction, type SearchState } from './actions';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Loader2, Search, FileText, GitCompareArrows, Download } from 'lucide-react';
import type { ArxivPaper } from '../services/arxiv';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from '../components/ui/textarea'; // Import Textarea


function SubmitButton({ icon: Icon, text, pendingText }: { icon: React.ElementType, text: string, pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        <>
          <Icon className="mr-2 h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  );
}

function generateMarkdownReport(state: SearchState): string {
  let report = `# Research Report: ${state.searchTopic || 'Selected Papers'}\n\n`;

  if (state.comparison?.analysis) {
    report += `## Comparative Analysis\n\n`;
    report += `${state.comparison.analysis}\n\n`;
    report += `## Papers Compared\n\n`;
  } else {
     report += `## Searched Papers\n\n`;
  }


  state.papers?.forEach((paper, index) => {
    report += `### ${index + 1}. ${paper.title}\n\n`;
    report += `**Authors:** ${paper.authors.join(', ')}\n`;
    report += `**Published:** ${paper.published}\n`;
    report += `**URL:** [${paper.url}](${paper.url})\n\n`;
    report += `**Abstract:**\n${paper.abstract}\n\n`;
    if (paper.summary) {
       report += `**AI Summary:**\n${paper.summary}\n\n`;
    }
     report += `---\n\n`;
  });


  // Basic attempt to extract sections from comparison analysis
  if (state.comparison?.analysis) {
      const analysis = state.comparison.analysis;
      const methodsMatch = analysis.match(/Methods:|Key Methods:|Methodologies:([\s\S]*?)(Performance|Open Research|Conclusion|$)/i);
      const performanceMatch = analysis.match(/Performance Benchmarks:|Benchmarks:|Results:([\s\S]*?)(Open Research|Conclusion|$)/i);
      const openProblemsMatch = analysis.match(/Open Research Questions:|Open Problems:|Future Work:([\s\S]*?)(Conclusion|$)/i);

      report += `## Extracted Sections (from Comparison)\n\n`;

      if (methodsMatch && methodsMatch[1]) {
          report += `### Key Methods\n\n${methodsMatch[1].trim()}\n\n`;
      }
      if (performanceMatch && performanceMatch[1]) {
          report += `### Performance Benchmarks\n\n${performanceMatch[1].trim()}\n\n`;
      }
      if (openProblemsMatch && openProblemsMatch[1]) {
          report += `### Open Research Questions\n\n${openProblemsMatch[1].trim()}\n\n`;
      }
  }


  return report;
}

function downloadMarkdown(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


export default function Home() {
  const initialState: SearchState = { message: null, errors: {}, papers: undefined, comparison: undefined, searchTopic: undefined };
  const [searchState, searchDispatch] = useFormState(searchPapersAction, initialState);
  const [compareState, compareDispatch] = useFormState(comparePapersAction, searchState ?? initialState); // Pass search state to compare

  // Combine states - prioritize compareState messages/errors if compare action was last
  const combinedState = useMemo(() => {
    // Heuristic: if compareState has a message different from searchState, assume compare action was last.
    const compareActionHappened = compareState?.message && compareState.message !== searchState?.message;
    return compareActionHappened ? compareState : searchState;
  }, [searchState, compareState]);


  const [selectedPapers, setSelectedPapers] = useState<Set<number>>(new Set());
  const [reportContent, setReportContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'search' | 'report'>('search');

  const handleCheckboxChange = (index: number, checked: boolean | 'indeterminate') => {
    setSelectedPapers(prev => {
      const newSet = new Set(prev);
      if (checked === true) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

   const handleGenerateReport = () => {
    if (combinedState) {
        const markdown = generateMarkdownReport(combinedState);
        setReportContent(markdown);
        setActiveTab('report'); // Switch to report tab
    }
   };

   const handleDownloadReport = () => {
       const topicSlug = combinedState?.searchTopic?.toLowerCase().replace(/\s+/g, '-') || 'research-report';
       const filename = `${topicSlug}.md`;
       downloadMarkdown(filename, reportContent);
   };


  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">ScholarAI</h1>
        <p className="text-lg text-muted-foreground">Your Autonomous Scientific Research Assistant</p>
      </header>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'report')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="search">Search & Compare</TabsTrigger>
          <TabsTrigger value="report" disabled={!reportContent}>Report</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><Search className="mr-2 h-5 w-5 text-primary" /> Search for Papers</CardTitle>
              <CardDescription>Enter a research topic to search on arXiv.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={searchDispatch}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    id="topic"
                    name="topic"
                    type="text"
                    placeholder="e.g., Recent breakthroughs in diffusion models"
                    className="flex-grow"
                    aria-describedby="topic-error"
                    defaultValue={combinedState?.searchTopic}
                  />
                  <SubmitButton icon={Search} text="Search" pendingText="Searching..." />
                </div>
                 {combinedState?.errors?.topic && (
                    <p id="topic-error" className="mt-2 text-sm text-destructive">
                      {combinedState.errors.topic.join(', ')}
                    </p>
                  )}
                  {combinedState?.message && !combinedState?.errors?.topic && (
                     <Alert className={`mt-4 ${combinedState.errors && Object.keys(combinedState.errors).length > 0 ? 'border-destructive' : 'border-primary/50'}`}>
                       <AlertTitle className={combinedState.errors && Object.keys(combinedState.errors).length > 0 ? 'text-destructive' : 'text-primary'}>Status</AlertTitle>
                       <AlertDescription>
                         {combinedState.message}
                       </AlertDescription>
                     </Alert>
                   )}
              </form>
            </CardContent>
          </Card>

          {combinedState?.papers && combinedState.papers.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" /> Search Results</CardTitle>
                <CardDescription>Found {combinedState.papers.length} papers related to "{combinedState.searchTopic}". Select papers to compare.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={compareDispatch}>
                    {/* Hidden input to carry over the topic */}
                     <input type="hidden" name="topic" value={combinedState.searchTopic || ''} />

                  <ScrollArea className="h-[400px] mb-4 border rounded-md p-4 bg-secondary/30">
                    <div className="space-y-4">
                      {combinedState.papers.map((paper, index) => (
                        <div key={paper.url || index} className="flex items-start space-x-4 p-3 bg-card rounded-md shadow-sm">
                          <Checkbox
                            id={`paper-${index}`}
                            name="selectedPapers"
                            value={index.toString()}
                            checked={selectedPapers.has(index)}
                            onCheckedChange={(checked) => handleCheckboxChange(index, checked)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`paper-${index}`} className="font-semibold text-base cursor-pointer hover:text-primary transition-colors">
                              {paper.title}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Authors: {paper.authors.join(', ')} ({paper.published})
                            </p>
                             <details className="mt-2 text-sm">
                               <summary className="cursor-pointer text-primary/80 hover:text-primary">Show Abstract & Summary</summary>
                               <p className="mt-1 text-muted-foreground italic">
                                 <strong>Abstract:</strong> {paper.abstract}
                               </p>
                               {paper.summary && (
                                 <p className="mt-2 text-foreground">
                                   <strong>AI Summary:</strong> {paper.summary}
                                 </p>
                               )}
                             </details>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                   {combinedState?.errors?.papers && (
                     <p className="mt-2 mb-2 text-sm text-destructive">
                       {combinedState.errors.papers.join(', ')}
                     </p>
                   )}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <p className="text-sm text-muted-foreground">{selectedPapers.size} paper(s) selected.</p>
                    <SubmitButton icon={GitCompareArrows} text="Compare Selected Papers" pendingText="Comparing..." />
                  </div>
                </form>
              </CardContent>
                 {combinedState?.comparison && (
                     <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                       <h3 className="font-semibold text-lg flex items-center"><GitCompareArrows className="mr-2 h-5 w-5 text-primary" /> Comparison Analysis</h3>
                       <ScrollArea className="h-[200px] w-full rounded-md border p-3 bg-secondary/30">
                           <p className="text-sm whitespace-pre-wrap">{combinedState.comparison.analysis}</p>
                       </ScrollArea>
                         <Button onClick={handleGenerateReport} variant="outline" className="mt-2">
                           <FileText className="mr-2 h-4 w-4" /> Generate Report from Comparison
                         </Button>
                     </CardFooter>
                 )}
            </Card>
          )}

            {/* Add button to generate report from search results if no comparison done yet */}
            {combinedState?.papers && combinedState.papers.length > 0 && !combinedState?.comparison && (
                <div className="mt-6 flex justify-end">
                   <Button onClick={handleGenerateReport} variant="outline">
                     <FileText className="mr-2 h-4 w-4" /> Generate Report from Search Results
                   </Button>
                </div>
            )}


        </TabsContent>

        <TabsContent value="report">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                 <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" /> Generated Report
                 </div>
                 <Button onClick={handleDownloadReport} size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4"/> Download Markdown
                 </Button>
              </CardTitle>
              <CardDescription>Markdown report summarizing the findings for "{combinedState?.searchTopic || 'Selected Papers'}".</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] rounded-md border p-4 bg-secondary/30">
                {/* Using Textarea to display Markdown, allows selection/copying */}
                <Textarea
                    readOnly
                    value={reportContent}
                    className="w-full h-full min-h-[580px] font-mono text-sm bg-transparent border-none focus-visible:ring-0 resize-none"
                    aria-label="Generated Markdown Report"
                 />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
