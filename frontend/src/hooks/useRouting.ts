import { useState } from "react";
import { useMap } from "./useMap";
import { Coordinates } from "../features/map/types";
import { Route, RouteRequest } from "../features/routing/types";
import routingService from "../features/routing/routingService";

export const useRouting = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getMapInstance } = useMap();

  const calculateRoute = async (origin: Coordinates, destination: Coordinates) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: RouteRequest = { origin, destination };
      const result = await routingService.calculateRoute(request);
      setRoute(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Error al calcular la ruta";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setError(null);
  };

  const drawRouteOnMap = () => {
    if (!route || !route.polyline) return;

    const map = getMapInstance();
    if (!map) return;

    // TODO: Implementar dibujo de polyline en el mapa usando Mapbox
  };

  return {
    route,
    isLoading,
    error,
    calculateRoute,
    clearRoute,
    drawRouteOnMap,
  };
};
