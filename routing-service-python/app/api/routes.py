from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.algorithms.dijkstra import dijkstra
from app.algorithms.astar import astar
from app.models.route_response import RouteResponse, RouteStep

router = APIRouter()

class RouteRequest(BaseModel):
    origin_lng: float
    origin_lat: float
    destination_lng: float
    destination_lat: float
    algorithm: Optional[str] = "dijkstra"

@router.post("", response_model=RouteResponse)
def calculate_route(request: RouteRequest, graph_data: dict = None):
    """
    Calcula la ruta más corta entre dos puntos del campus.
    """
    # Get graph from app state - this is a simplified version
    # In production, this would use the actual campus graph
    
    origin = (request.origin_lat, request.origin_lng)
    destination = (request.destination_lat, request.destination_lng)
    
    # Find nearest nodes to origin and destination
    # This is a placeholder - in production, you'd use spatial indexing
    
    if request.algorithm == "astar":
        path, distance = astar(graph_data, origin, destination)
    else:
        path, distance = dijkstra(graph_data, origin, destination)
    
    if not path:
        raise HTTPException(status_code=404, detail="No se encontró una ruta")
    
    # Calculate duration (assuming average walking speed of 5 km/h)
    speed_mps = 5 / 3.6  # m/s
    duration = distance / speed_mps
    
    # Generate steps
    steps = []
    for i in range(len(path) - 1):
        step_distance = _calculate_distance(path[i], path[i + 1])
        step_duration = step_distance / speed_mps
        
        step = RouteStep(
            instruction=f"Continuar hacia el punto {i + 2}",
            distance=step_distance,
            duration=step_duration,
            start_point={"lat": path[i][0], "lng": path[i][1]},
            end_point={"lat": path[i + 1][0], "lng": path[i + 1][1]}
        )
        steps.append(step)
    
    return RouteResponse(
        id="route-123",
        origin={"coordinates": {"lat": origin[0], "lng": origin[1]}},
        destination={"coordinates": {"lat": destination[0], "lng": destination[1]}},
        distance=distance,
        duration=duration,
        steps=steps,
        polyline=_encode_polyline(path)
    )

def _calculate_distance(coord1, coord2):
    """Calculate distance between two coordinates using Haversine formula."""
    import math
    
    lat1, lng1 = coord1
    lat2, lng2 = coord2
    
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2) ** 2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def _encode_polyline(points):
    """Encode points as polyline (simplified version)."""
    # In production, use proper polyline encoding
    return f"polyline_{len(points)}_points"
