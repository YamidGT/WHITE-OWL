import { useState } from "react";
import { useMap } from "../../hooks/useMap";
import eventService from "./eventService";
import { EventInput } from "./types";

interface EventFormProps {
  onSuccess?: () => void;
}

export default function EventForm({ onSuccess }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [category, setCategory] = useState<EventInput["category"]>("academic");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getMapInstance } = useMap();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const map = getMapInstance();
      const center = map?.getCenter();

      const input: EventInput = {
        title,
        description,
        organizer,
        category,
        startDate,
        endDate,
        coordinates: {
          lng: center?.lng || -74.08175,
          lat: center?.lat || 4.6351,
        },
      };

      await eventService.createEvent(input);
      onSuccess?.();
      
      // Limpiar formulario
      setTitle("");
      setDescription("");
      setOrganizer("");
      setCategory("academic");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.title}>Crear Evento</h3>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
          rows={3}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Organizador</label>
        <input
          type="text"
          value={organizer}
          onChange={(e) => setOrganizer(e.target.value)}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Categoría</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as EventInput["category"])}
          style={styles.select}
        >
          <option value="academic">Académico</option>
          <option value="cultural">Cultural</option>
          <option value="sports">Deportivo</option>
          <option value="social">Social</option>
          <option value="other">Otro</option>
        </select>
      </div>

      <div style={styles.row}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Inicio</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Fin</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={styles.button}
      >
        {isSubmitting ? "Creando..." : "Crear Evento"}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "white",
    borderRadius: "8px",
  },
  title: {
    marginTop: 0,
    color: "#1e3a5f",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  label: {
    fontWeight: "bold",
    fontSize: "0.875rem",
    color: "#333",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  textarea: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    resize: "vertical",
  },
  select: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  row: {
    display: "flex",
    gap: "1rem",
  },
  button: {
    padding: "0.75rem",
    backgroundColor: "#1e3a5f",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
