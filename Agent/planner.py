# agent/planner.py
from tools.arxiv_scraper import fetch_arxiv_papers
from tools.summarizer import summarize_text
from tools.vector_store import VectorStore

def research_topic(topic):
    papers_xml = fetch_arxiv_papers(topic)
    # (Parsing XML and extracting abstracts is needed here; simplified for brevity)
    abstracts = ["abstract1", "abstract2"]  # Example abstracts
    summaries = [summarize_text(a) for a in abstracts]

    store = VectorStore()
    store.add_docs(summaries)
    results = store.search(topic)

    return results
