import { Coordinates } from "../map/types";

export interface RoutePoint {
  coordinates: Coordinates;
  name?: string;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startPoint: Coordinates;
  endPoint: Coordinates;
}

export interface Route {
  id: string;
  origin: RoutePoint;
  destination: RoutePoint;
  distance: number;
  duration: number;
  steps: RouteStep[];
  polyline?: string;
}

export interface RouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  algorithm?: "dijkstra" | "astar";
}
