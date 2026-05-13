

---

# PathQuest AI — Redesigned Spec

### *Smart Route Planner for 2nd Year AI/ML Project*

---

## I. TECH STACK (Kept, Simplified)

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js + Tailwind CSS+shadecn +framer motiono| Clean UI, easy to run locally |
| Map | Leaflet.js | Free, simple, no API key needed |
| Backend | Python + FastAPI | Runs the algorithms |
| Graph | NetworkX | Handles nodes/edges cleanly |

**No Supabase.** Just a hardcoded city graph stored in Python — enough to demo everything your faculty wants to see.

---

## II. WHAT YOU ACTUALLY BUILD

### The Graph
A **hardcoded graph of 10–15 Indian city nodes** (or fictional intersections) with distances as edge weights. Stored as a Python dictionary. No database needed.

### The Algorithms (this is what gets you marks)
- **Dijkstra's** — finds shortest path, logs every node visited
- **A\* Search** — uses straight-line (Haversine) distance as heuristic
- **Greedy Best-First** — pure heuristic, fastest but not optimal
- **Binary Search** — used to look up a node by name from a sorted list

### The API (3 endpoints, nothing more)
```
POST /find-path        → runs chosen algorithm, returns path + metrics
GET  /nodes            → returns all nodes and edges for the map
POST /set-traffic      → updates a traffic multiplier on one edge
```

### The Frontend (simple, clean)
- Leaflet map showing nodes as markers and edges as lines
- Dropdown: pick Start node, End node, Algorithm
- Button: **Find Path** → calls FastAPI → draws the result on map
- Metrics panel: nodes explored, time taken, path cost
- A **Compare Mode** button that runs Dijkstra vs A\* together and shows both results side by side
- One slider per edge to simulate traffic (updates edge weight)

---

## III. WHAT YOU CUT (and why)

| Removed | Why |
|---|---|
| Supabase / PostgreSQL | Overkill — a Python dict is enough for demo |
| WebSockets / Realtime | Not needed, a simple POST call does the job |
| Framer Motion animations | Nice but zero marks value |
| ShadCN UI | Adds setup complexity for no academic benefit |
| Docker / deployment | Run it locally, that's fine for viva |

---

## IV. PROJECT FOLDER STRUCTURE

```
pathquest/
├── backend/
│   ├── main.py          ← FastAPI app
│   ├── graph.py         ← hardcoded city graph
│   ├── algorithms.py    ← Dijkstra, A*, Greedy, Binary Search
│   └── requirements.txt
├── frontend/
│   ├── pages/index.tsx  ← main UI
│   ├── components/
│   │   ├── MapView.tsx  ← Leaflet map
│   │   └── MetricsPanel.tsx
│   └── package.json
└── README.md
```

---

## V. VIVA TALKING POINTS (this is what saves you)

**On A\*:** *"A\* uses f(n) = g(n) + h(n) where g is the actual cost from start and h is the Haversine straight-line distance to the goal. This makes it informed — it doesn't explore unnecessary nodes."*

**On Dijkstra:** *"Dijkstra is our baseline. It explores all neighbours uniformly using a min-priority queue — O((E+V) log V). It always finds the optimal path but visits more nodes than A\*."*

**On Binary Search:** *"When the user types a city name, we binary search a sorted array of node names to find it in O(log n) instead of scanning linearly."*

**On Traffic:** *"We multiply the base edge weight by a traffic factor. A\* and Dijkstra automatically route around heavy edges since the cost increases."*

---

## VI. REALISTIC TIMELINE

| Week | Task |
|---|---|
| 1 | Set up FastAPI, build graph.py, implement algorithms.py |
| 2 | Test all 4 algorithms via Postman, verify outputs |
| 3 | Build Next.js frontend, connect to API, render Leaflet map |
| 4 | Add Compare Mode + traffic slider, polish UI, write report |

---
