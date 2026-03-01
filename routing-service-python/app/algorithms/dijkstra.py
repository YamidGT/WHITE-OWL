import heapq
import math

def dijkstra(graph_data: dict, origin: tuple, destination: tuple) -> tuple:
    """
    Implementación del algoritmo de Dijkstra para encontrar la ruta más corta.
    
    Args:
        graph_data: Diccionario con los datos del grafo (nodes y edges)
        origin: Tupla (lat, lng) del origen
        destination: Tupla (lat, lng) del destino
    
    Returns:
        Tupla (path, distance) donde path es una lista de coordenadas
        y distance es la distancia total en metros
    """
    # Esta es una implementación simplificada
    # En producción, usaría el grafo real del campus
    
    nodes = graph_data.get("nodes", [])
    edges = graph_data.get("edges", [])
    
    if not nodes:
        # Si no hay datos del grafo, devolver ruta directa
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
    
    # Dijkstra
    distances = {node: float("inf") for node in graph}
    distances[start_node] = 0
    previous = {node: None for node in graph}
    pq = [(0, start_node)]
    visited = set()
    
    while pq:
        current_dist, current_node = heapq.heappop(pq)
        
        if current_node in visited:
            continue
        
        visited.add(current_node)
        
        if current_node == end_node:
            break
        
        for neighbor, weight in graph.get(current_node, []):
            if neighbor in visited:
                continue
            
            new_dist = current_dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = current_node
                heapq.heappush(pq, (new_dist, neighbor))
    
    # Reconstruir ruta
    if distances[end_node] == float("inf"):
        return [], 0
    
    path = []
    current = end_node
    while current is not None:
        path.append(node_coords[current])
        current = previous[current]
    
    path.reverse()
    
    # Agregar puntos de origen y destino
    if path and path[0] != origin:
        path.insert(0, origin)
    if path and path[-1] != destination:
        path.append(destination)
    
    return path, distances[end_node]

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
    
    R = 6371000  # Radio de la Tierra en metros
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2) ** 2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c
