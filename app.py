# api.py
from fastapi import FastAPI
from agent.planner import research_topic
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend (Next.js) to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/research")
def get_research(topic: str):
    results = research_topic(topic)
    return {"results": results}
