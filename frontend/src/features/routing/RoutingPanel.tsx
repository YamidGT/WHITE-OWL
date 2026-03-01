import { useState } from "react";
import { useMap } from "../../hooks/useMap";
import { Coordinates } from "../map/types";
import routingService from "./routingService";
import { Route } from "./types";
import RouteInfo from "./RouteInfo";

export default function RoutingPanel() {
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getMapInstance } = useMap();

  const handleCalculateRoute = async () => {
    if (!origin || !destination) {
      setError("Selecciona origen y destino en el mapa");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await routingService.calculateRoute({
        origin,
        destination,
      });
      setRoute(result);

      // Dibujar ruta en el mapa
      const map = getMapInstance();
      if (map && result.polyline) {
        // TODO: Implementar dibujo de polyline en el mapa
      }
    } catch (err: any) {
      setError(err.message || "Error al calcular ruta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    const map = getMapInstance();
    if (!map) return;

    // Obtener coordenadas del click
    // Implementar según sea necesario
  };

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Enrutamiento</h3>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Origen</label>
        <input
          type="text"
          placeholder="Selecciona en el mapa"
          value={origin ? `${origin.lat}, ${origin.lng}` : ""}
          readOnly
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Destino</label>
        <input
          type="text"
          placeholder="Selecciona en el mapa"
          value={destination ? `${destination.lat}, ${destination.lng}` : ""}
          readOnly
          style={styles.input}
        />
      </div>

      <button
        onClick={handleCalculateRoute}
        disabled={!origin || !destination || isLoading}
        style={styles.button}
      >
        {isLoading ? "Calculando..." : "Calcular Ruta"}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {route && <RouteInfo route={route} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    width: "300px",
    zIndex: 10,
  },
  title: {
    marginTop: 0,
    marginBottom: "1rem",
    color: "#1e3a5f",
  },
  inputGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "0.875rem",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#1e3a5f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "#e74c3c",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
  },
};
