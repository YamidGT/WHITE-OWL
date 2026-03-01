from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.algorithms.graph import CampusGraph
import json
import os

app = FastAPI(
    title="White OWL Routing Service",
    description="Servicio de enrutamiento para el campus de la Universidad Nacional de Colombia",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load campus graph data
data_path = os.path.join(os.path.dirname(__file__), "app", "data", "campus_graph.json")
try:
    with open(data_path, "r") as f:
        campus_data = json.load(f)
    campus_graph = CampusGraph(campus_data)
except FileNotFoundError:
    print("Warning: campus_graph.json not found, using empty graph")
    campus_graph = CampusGraph({"nodes": [], "edges": []})

# Add graph to app state
app.state.graph = campus_graph

# Include routes
app.include_router(routes.router, prefix="/calculate-route", tags=["routing"])

@app.get("/")
def root():
    return {
        "service": "White OWL Routing Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
