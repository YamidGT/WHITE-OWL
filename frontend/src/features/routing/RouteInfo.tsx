import { Route } from "./types";
import { formatDistance } from "../../utils/formatDistance";

interface RouteInfoProps {
  route: Route;
}

export default function RouteInfo({ route }: RouteInfoProps) {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Ruta Calculada</h4>
      
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Distancia</span>
          <span style={styles.statValue}>{formatDistance(route.distance)}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Tiempo</span>
          <span style={styles.statValue}>{formatDuration(route.duration)}</span>
        </div>
      </div>

      <div style={styles.steps}>
        <h5 style={styles.stepsTitle}>Instrucciones:</h5>
        {route.steps.map((step, index) => (
          <div key={index} style={styles.step}>
            <span style={styles.stepNumber}>{index + 1}</span>
            <span style={styles.stepInstruction}>{step.instruction}</span>
            <span style={styles.stepDistance}>{formatDistance(step.distance)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
  },
  title: {
    marginTop: 0,
    marginBottom: "1rem",
    color: "#1e3a5f",
  },
  stats: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  stat: {
    flex: 1,
    textAlign: "center",
  },
  statLabel: {
    display: "block",
    fontSize: "0.75rem",
    color: "#666",
  },
  statValue: {
    display: "block",
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#1e3a5f",
  },
  steps: {
    marginTop: "1rem",
  },
  stepsTitle: {
    marginTop: 0,
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    color: "#333",
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0",
    borderBottom: "1px solid #eee",
  },
  stepNumber: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#1e3a5f",
    color: "white",
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepInstruction: {
    flex: 1,
    fontSize: "0.875rem",
  },
  stepDistance: {
    fontSize: "0.75rem",
    color: "#666",
  },
};
