# agent/tools/arxiv_scraper.py
import requests

def fetch_arxiv_papers(query="diffusion models", max_results=5):
    url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={max_results}"
    response = requests.get(url)
    return response.text
