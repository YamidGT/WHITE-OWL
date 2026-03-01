import { useState, useEffect } from "react";
import eventService from "./eventService";
import { Event } from "./types";

interface EventListProps {
  onSelectEvent?: (event: Event) => void;
}

export default function EventList({ onSelectEvent }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const getCategoryColor = (category: Event["category"]) => {
    const colors = {
      academic: "#3498db",
      cultural: "#9b59b6",
      sports: "#2ecc71",
      social: "#e74c3c",
      other: "#95a5a6",
    };
    return colors[category];
  };

  if (isLoading) return <p>Cargando eventos...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Eventos</h3>
      {events.length === 0 ? (
        <p>No hay eventos disponibles</p>
      ) : (
        <ul style={styles.list}>
          {events.map((event) => (
            <li key={event.id} style={styles.item}>
              <div
                style={{
                  ...styles.categoryBadge,
                  backgroundColor: getCategoryColor(event.category),
                }}
              >
                {event.category}
              </div>
              <div style={styles.content} onClick={() => onSelectEvent?.(event)}>
                <h4 style={styles.eventTitle}>{event.title}</h4>
                <p style={styles.eventInfo}>
                  {new Date(event.startDate).toLocaleDateString()} -{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </p>
                <p style={styles.eventInfo}>{event.organizer}</p>
              </div>
              <button
                onClick={() => handleDelete(event.id)}
                style={styles.deleteButton}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "1rem",
    backgroundColor: "white",
    borderRadius: "8px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  title: {
    marginTop: 0,
    marginBottom: "1rem",
    color: "#1e3a5f",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    borderBottom: "1px solid #eee",
  },
  categoryBadge: {
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  content: {
    flex: 1,
    cursor: "pointer",
  },
  eventTitle: {
    margin: 0,
    fontSize: "1rem",
    color: "#333",
  },
  eventInfo: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#666",
  },
  deleteButton: {
    padding: "0.25rem 0.5rem",
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};
