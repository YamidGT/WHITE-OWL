import axios from "axios";
import { Route, RouteRequest } from "./types";

const ROUTING_API_URL = import.meta.env.VITE_ROUTING_API_URL || "http://localhost:8000";

export const routingService = {
  async calculateRoute(request: RouteRequest): Promise<Route> {
    const response = await axios.post(`${ROUTING_API_URL}/calculate-route`, {
      origin_lng: request.origin.lng,
      origin_lat: request.origin.lat,
      destination_lng: request.destination.lng,
      destination_lat: request.destination.lat,
      algorithm: request.algorithm || "dijkstra",
    });
    return response.data;
  },

  async getRouteById(id: string): Promise<Route> {
    const response = await axios.get(`${ROUTING_API_URL}/routes/${id}`);
    return response.data;
  },

  async getRouteHistory(): Promise<Route[]> {
    const response = await axios.get(`${ROUTING_API_URL}/routes/history`);
    return response.data;
  },
};

export default routingService;
