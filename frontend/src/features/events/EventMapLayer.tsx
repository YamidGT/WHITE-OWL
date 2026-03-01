import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Event } from "./types";

interface EventMapLayerProps {
  map: mapboxgl.Map | null;
  events: Event[];
}

export default function EventMapLayer({ map, events }: EventMapLayerProps) {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Agregar nuevos marcadores
    events.forEach((event) => {
      const el = document.createElement("div");
      el.className = "event-marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = getEventColor(event.category);
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <p><strong>Fecha:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p><strong>Organizador:</strong> ${event.organizer}</p>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.coordinates.lng, event.coordinates.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
    };
  }, [map, events]);

  return null;
}

function getEventColor(category: Event["category"]): string {
  const colors = {
    academic: "#3498db",
    cultural: "#9b59b6",
    sports: "#2ecc71",
    social: "#e74c3c",
    other: "#95a5a6",
  };
  return colors[category];
}
