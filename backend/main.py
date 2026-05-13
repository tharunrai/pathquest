from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import graph as g_module
import algorithms as alg

app = FastAPI(title="PathQuest AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request Models ──────────────────────────────────────────────
class PathRequest(BaseModel):
    start: str
    end: str
    algorithm: str  # "dijkstra" | "astar" | "greedy"


class CompareRequest(BaseModel):
    start: str
    end: str


class TrafficRequest(BaseModel):
    from_city: str
    to_city: str
    multiplier: float  # 1.0 = normal, 3.0 = 3× slower


class SearchRequest(BaseModel):
    query: str


# ─── Helpers ────────────────────────────────────────────────────
def validate_cities(*cities):
    for city in cities:
        if city not in g_module.CITIES:
            raise HTTPException(status_code=400, detail=f"Unknown city: '{city}'")


# ─── Endpoints ───────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "PathQuest AI is running 🚀", "version": "1.0.0"}


@app.get("/nodes")
def get_nodes():
    nodes, edges = g_module.get_nodes_and_edges()
    return {"nodes": nodes, "edges": edges}


@app.post("/find-path")
def find_path(req: PathRequest):
    validate_cities(req.start, req.end)
    if req.start == req.end:
        raise HTTPException(status_code=400, detail="Start and end must be different cities")

    algo = req.algorithm.lower()
    if algo == "dijkstra":
        result = alg.dijkstra(req.start, req.end)
    elif algo == "astar":
        result = alg.astar(req.start, req.end)
    elif algo == "greedy":
        result = alg.greedy_best_first(req.start, req.end)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm: '{req.algorithm}'")

    if result is None:
        raise HTTPException(status_code=404, detail="No path found between these cities")
    return result


@app.post("/compare")
def compare(req: CompareRequest):
    """Run Dijkstra, A* and Greedy side-by-side."""
    validate_cities(req.start, req.end)
    if req.start == req.end:
        raise HTTPException(status_code=400, detail="Start and end must be different cities")

    return {
        "dijkstra": alg.dijkstra(req.start, req.end),
        "astar":    alg.astar(req.start, req.end),
        "greedy":   alg.greedy_best_first(req.start, req.end),
    }


@app.post("/set-traffic")
def set_traffic(req: TrafficRequest):
    validate_cities(req.from_city, req.to_city)
    if not (0.5 <= req.multiplier <= 5.0):
        raise HTTPException(status_code=400, detail="Multiplier must be between 0.5 and 5.0")

    # Check edge exists
    valid_edge = any(
        {c1, c2} == {req.from_city, req.to_city}
        for c1, c2, _ in g_module.RAW_EDGES
    )
    if not valid_edge:
        raise HTTPException(status_code=400, detail=f"No direct edge between {req.from_city} and {req.to_city}")

    key = g_module.get_edge_key(req.from_city, req.to_city)
    g_module.traffic_multipliers[key] = req.multiplier
    return {
        "message": f"Traffic on {req.from_city} ↔ {req.to_city} set to {req.multiplier}×",
        "edge": f"{req.from_city}↔{req.to_city}",
        "multiplier": req.multiplier,
    }


@app.get("/traffic")
def get_traffic():
    """Return all current traffic multipliers."""
    return {
        "multipliers": {
            f"{k[0]}↔{k[1]}": v
            for k, v in g_module.traffic_multipliers.items()
        }
    }


@app.post("/search-node")
def search_node(req: SearchRequest):
    return alg.binary_search_node(req.query)
