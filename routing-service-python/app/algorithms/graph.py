import math

class CampusGraph:
    """
    Representación del grafo del campus UNAL.
    """
    
    def __init__(self, data: dict):
        self.nodes = {}
        self.edges = {}
        self._build_graph(data)
    
    def _build_graph(self, data: dict):
        """Construye el grafo a partir de los datos."""
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        
        # Agregar nodos
        for node in nodes:
            self.nodes[node["id"]] = {
                "id": node["id"],
                "name": node.get("name", ""),
                "lat": node["lat"],
                "lng": node["lng"],
                "type": node.get("type", "waypoint")
            }
        
        # Agregar aristas
        for edge in edges:
            from_node = edge["from"]
            to_node = edge["to"]
            weight = edge.get("weight", self._calculate_distance(
                self.nodes.get(from_node, {}),
                self.nodes.get(to_node, {})
            ))
            
            if from_node not in self.edges:
                self.edges[from_node] = []
            self.edges[from_node].append({"to": to_node, "weight": weight})
            
            # Grafo no dirigido
            if to_node not in self.edges:
                self.edges[to_node] = []
            self.edges[to_node].append({"to": from_node, "weight": weight})
    
    def _calculate_distance(self, node1: dict, node2: dict) -> float:
        """Calcula la distancia entre dos nodos usando Haversine."""
        if not node1 or not node2:
            return 0
        
        lat1 = node1.get("lat", 0)
        lng1 = node1.get("lng", 0)
        lat2 = node2.get("lat", 0)
        lng2 = node2.get("lng", 0)
        
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
    
    def get_neighbors(self, node_id: str) -> list:
        """Obtiene los nodos vecinos de un nodo."""
        return self.edges.get(node_id, [])
    
    def get_node(self, node_id: str) -> dict:
        """Obtiene un nodo por su ID."""
        return self.nodes.get(node_id, {})
    
    def find_nearest_node(self, lat: float, lng: float) -> str:
        """Encuentra el nodo más cercano a unas coordenadas."""
        if not self.nodes:
            return None
        
        min_distance = float("inf")
        nearest_node = None
        
        for node_id, node in self.nodes.items():
            distance = self._calculate_distance(
                {"lat": lat, "lng": lng},
                node
            )
            if distance < min_distance:
                min_distance = distance
                nearest_node = node_id
        
        return nearest_node
