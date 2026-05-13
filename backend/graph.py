from math import radians, cos, sin, asin, sqrt

# 15 real Indian cities with lat/lng
CITIES = {
    "Delhi":     {"lat": 28.6139, "lng": 77.2090},
    "Jaipur":    {"lat": 26.9124, "lng": 75.7873},
    "Agra":      {"lat": 27.1767, "lng": 78.0081},
    "Lucknow":   {"lat": 26.8467, "lng": 80.9462},
    "Varanasi":  {"lat": 25.3176, "lng": 82.9739},
    "Kolkata":   {"lat": 22.5726, "lng": 88.3639},
    "Bhopal":    {"lat": 23.2599, "lng": 77.4126},
    "Indore":    {"lat": 22.7196, "lng": 75.8577},
    "Ahmedabad": {"lat": 23.0225, "lng": 72.5714},
    "Mumbai":    {"lat": 19.0760, "lng": 72.8777},
    "Pune":      {"lat": 18.5204, "lng": 73.8567},
    "Nagpur":    {"lat": 21.1458, "lng": 79.0882},
    "Hyderabad": {"lat": 17.3850, "lng": 78.4867},
    "Bangalore": {"lat": 12.9716, "lng": 77.5946},
    "Chennai":   {"lat": 13.0827, "lng": 80.2707},
}

# (city1, city2, distance_km) — approximate road distances
RAW_EDGES = [
    ("Delhi",     "Jaipur",    270),
    ("Delhi",     "Agra",      200),
    ("Delhi",     "Lucknow",   500),
    ("Jaipur",    "Agra",      230),
    ("Jaipur",    "Ahmedabad", 650),
    ("Jaipur",    "Bhopal",    600),
    ("Agra",      "Lucknow",   350),
    ("Agra",      "Bhopal",    560),
    ("Lucknow",   "Varanasi",  300),
    ("Lucknow",   "Kolkata",   1000),
    ("Varanasi",  "Kolkata",   700),
    ("Bhopal",    "Indore",    200),
    ("Bhopal",    "Nagpur",    350),
    ("Ahmedabad", "Mumbai",    530),
    ("Ahmedabad", "Indore",    400),
    ("Mumbai",    "Pune",      150),
    ("Mumbai",    "Hyderabad", 700),
    ("Pune",      "Hyderabad", 560),
    ("Pune",      "Bangalore", 830),
    ("Indore",    "Nagpur",    450),
    ("Nagpur",    "Hyderabad", 500),
    ("Hyderabad", "Bangalore", 570),
    ("Hyderabad", "Chennai",   630),
    ("Bangalore", "Chennai",   350),
]

# Traffic multipliers: frozenset(city1, city2) -> float (1.0 = normal)
traffic_multipliers: dict = {}


def get_edge_key(c1: str, c2: str) -> tuple:
    return tuple(sorted([c1, c2]))


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Straight-line distance between two lat/lng points in km."""
    R = 6371
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
    return R * 2 * asin(sqrt(a))


def build_graph() -> dict:
    """Build adjacency list applying current traffic multipliers."""
    graph: dict = {city: [] for city in CITIES}
    for c1, c2, base in RAW_EDGES:
        key = get_edge_key(c1, c2)
        weight = base * traffic_multipliers.get(key, 1.0)
        graph[c1].append((c2, weight))
        graph[c2].append((c1, weight))
    return graph


def get_nodes_and_edges():
    nodes = [
        {"id": name, "lat": data["lat"], "lng": data["lng"]}
        for name, data in CITIES.items()
    ]
    edges = [
        {
            "from": c1,
            "to": c2,
            "base_distance": base,
            "traffic_multiplier": traffic_multipliers.get(get_edge_key(c1, c2), 1.0),
            "effective_weight": round(base * traffic_multipliers.get(get_edge_key(c1, c2), 1.0), 2),
        }
        for c1, c2, base in RAW_EDGES
    ]
    return nodes, edges
