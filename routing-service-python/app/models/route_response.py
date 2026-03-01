from pydantic import BaseModel
from typing import List, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class RoutePoint(BaseModel):
    coordinates: Coordinates
    name: Optional[str] = None

class RouteStep(BaseModel):
    instruction: str
    distance: float
    duration: float
    start_point: Coordinates
    end_point: Coordinates

class RouteResponse(BaseModel):
    id: str
    origin: RoutePoint
    destination: RoutePoint
    distance: float
    duration: float
    steps: List[RouteStep]
    polyline: Optional[str] = None
