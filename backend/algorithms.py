import heapq
import time
from graph import CITIES, build_graph, haversine


def _reconstruct_path(prev: dict, start: str, end: str) -> list | None:
    path = []
    cur = end
    while cur is not None:
        path.append(cur)
        cur = prev.get(cur)
    path.reverse()
    return path if path[0] == start else None


def dijkstra(start: str, end: str) -> dict | None:
    t0 = time.perf_counter()
    graph = build_graph()

    dist = {c: float("inf") for c in CITIES}
    dist[start] = 0
    prev: dict = {start: None}
    pq = [(0.0, start)]
    visited: set = set()
    nodes_explored = 0
    exploration_order = []

    while pq:
        cost, u = heapq.heappop(pq)
        if u in visited:
            continue
        visited.add(u)
        nodes_explored += 1
        exploration_order.append(u)
        if u == end:
            break
        for v, w in graph[u]:
            nc = cost + w
            if nc < dist[v]:
                dist[v] = nc
                prev[v] = u
                heapq.heappush(pq, (nc, v))

    path = _reconstruct_path(prev, start, end)
    if path is None:
        return None

    return {
        "algorithm": "Dijkstra",
        "path": path,
        "total_cost": round(dist[end], 2),
        "nodes_explored": nodes_explored,
        "exploration_order": exploration_order,
        "time_ms": round((time.perf_counter() - t0) * 1000, 4),
    }


def astar(start: str, end: str) -> dict | None:
    t0 = time.perf_counter()
    graph = build_graph()

    def h(node: str) -> float:
        c1, c2 = CITIES[node], CITIES[end]
        return haversine(c1["lat"], c1["lng"], c2["lat"], c2["lng"])

    g_cost = {c: float("inf") for c in CITIES}
    g_cost[start] = 0
    prev: dict = {start: None}
    pq = [(h(start), start)]
    visited: set = set()
    nodes_explored = 0
    exploration_order = []

    while pq:
        _, u = heapq.heappop(pq)
        if u in visited:
            continue
        visited.add(u)
        nodes_explored += 1
        exploration_order.append(u)
        if u == end:
            break
        for v, w in graph[u]:
            ng = g_cost[u] + w
            if ng < g_cost[v]:
                g_cost[v] = ng
                prev[v] = u
                heapq.heappush(pq, (ng + h(v), v))

    path = _reconstruct_path(prev, start, end)
    if path is None:
        return None

    return {
        "algorithm": "A*",
        "path": path,
        "total_cost": round(g_cost[end], 2),
        "nodes_explored": nodes_explored,
        "exploration_order": exploration_order,
        "time_ms": round((time.perf_counter() - t0) * 1000, 4),
    }


def prims_path(start: str, end: str) -> dict | None:
    t0 = time.perf_counter()
    graph = build_graph()

    visited = {start}
    prev: dict = {start: None}
    pq = []
    
    nodes_explored = 1
    exploration_order = [start]

    # Initialize priority queue with edges from the start node
    for v, w in graph[start]:
        heapq.heappush(pq, (w, start, v))

    # Build the Minimum Spanning Tree
    while pq:
        w, u, v = heapq.heappop(pq)
        if v not in visited:
            visited.add(v)
            prev[v] = u  # Track the parent directly in the tree
            nodes_explored += 1
            exploration_order.append(v)
            
            # Add new neighboring edges to the priority queue
            for next_v, next_w in graph[v]:
                if next_v not in visited:
                    heapq.heappush(pq, (next_w, v, next_v))

    path = _reconstruct_path(prev, start, end)
    if path is None:
        return None

    # Compute actual cost of the path
    total_cost = 0.0
    for i in range(len(path) - 1):
        for v, w in graph[path[i]]:
            if v == path[i + 1]:
                total_cost += w
                break

    return {
        "algorithm": "Prim's (MST Path)",
        "path": path,
        "total_cost": round(total_cost, 2),
        "nodes_explored": nodes_explored,
        "exploration_order": exploration_order,
        "time_ms": round((time.perf_counter() - t0) * 1000, 4),
    }


def binary_search_node(query: str) -> dict:
    """Binary search on sorted city names (case-insensitive)."""
    sorted_nodes = sorted(CITIES.keys())
    lo, hi = 0, len(sorted_nodes) - 1
    q = query.strip().lower()

    while lo <= hi:
        mid = (lo + hi) // 2
        mid_val = sorted_nodes[mid].lower()
        if mid_val == q:
            return {"found": True, "node": sorted_nodes[mid], "index": mid, "sorted_list": sorted_nodes}
        elif mid_val < q:
            lo = mid + 1
        else:
            hi = mid - 1

    return {"found": False, "node": None, "index": -1, "sorted_list": sorted_nodes}
