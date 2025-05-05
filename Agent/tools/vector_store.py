# agent/tools/vector_store.py
import faiss
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

class VectorStore:
    def __init__(self):
        self.index = faiss.IndexFlatL2(384)
        self.docs = []

    def add_docs(self, texts):
        embeddings = model.encode(texts)
        self.index.add(embeddings)
        self.docs.extend(texts)

    def search(self, query, k=3):
        query_vec = model.encode([query])
        _, indices = self.index.search(query_vec, k)
        return [self.docs[i] for i in indices[0]]
