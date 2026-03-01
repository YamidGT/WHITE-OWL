import heapq
import math

def astar(graph_data: dict, origin: tuple, destination: tuple) -> tuple:
    """
    Implementación del algoritmo A* para encontrar la ruta más corta.
    
    Args:
        graph_data: Diccionario con los datos del grafo (nodes y edges)
        origin: Tupla (lat, lng) del origen
        destination: Tupla (lat, lng) del destino
    
    Returns:
        Tupla (path, distance) donde path es una lista de coordenadas
        y distance es la distancia total en metros
    """
    nodes = graph_data.get("nodes", [])
    edges = graph_data.get("edges", [])
    
    if not nodes:
        distance = _haversine(origin, destination)
        return [origin, destination], distance
    
    # Construir grafo
    graph = {}
    node_coords = {}
    
    for node in nodes:
        node_id = node["id"]
        graph[node_id] = []
        node_coords[node_id] = (node["lat"], node["lng"])
    
    for edge in edges:
        from_id = edge["from"]
        to_id = edge["to"]
        weight = edge.get("weight", _haversine(
            node_coords.get(from_id, origin),
            node_coords.get(to_id, destination)
        ))
        
        if from_id in graph:
            graph[from_id].append((to_id, weight))
        if to_id in graph:
            graph[to_id].append((from_id, weight))
    
    # Encontrar nodos más cercanos
    start_node = _find_nearest_node(origin, node_coords)
    end_node = _find_nearest_node(destination, node_coords)
    
    if not start_node or not end_node:
        distance = _haversine(origin, destination)
        return [origin, destination], distance
    
    # A* algorithm
    open_set = [(0, start_node)]
    came_from = {}
    g_score = {node: float("inf") for node in graph}
    g_score[start_node] = 0
    f_score = {node: float("inf") for node in graph}
    f_score[start_node] = _haversine(node_coords[start_node], destination)
    
    while open_set:
        _, current = heapq.heappop(open_set)
        
        if current == end_node:
            # Reconstruir ruta
            path = []
            while current in came_from:
                path.append(node_coords[current])
                current = came_from[current]
            path.append(node_coords[current])
            path.reverse()
            
            if path[0] != origin:
                path.insert(0, origin)
            if path[-1] != destination:
                path.append(destination)
            
            return path, g_score[end_node]
        
        for neighbor, weight in graph.get(current, []):
            tentative_g = g_score[current] + weight
            
            if tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + _haversine(node_coords[neighbor], destination)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))
    
    # Si no se encontró ruta
    distance = _haversine(origin, destination)
    return [origin, destination], distance

def _find_nearest_node(coords: tuple, node_coords: dict) -> str:
    """Encuentra el nodo más cercano a unas coordenadas."""
    min_distance = float("inf")
    nearest_node = None
    
    for node_id, node_coord in node_coords.items():
        distance = _haversine(coords, node_coord)
        if distance < min_distance:
            min_distance = distance
            nearest_node = node_id
    
    return nearest_node

def _haversine(coord1: tuple, coord2: tuple) -> float:
    """Calcula la distancia usando la fórmula de Haversine."""
    lat1, lng1 = coord1
    lat2, lng2 = coord2
    
    R = 6371000
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2) ** 2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c
