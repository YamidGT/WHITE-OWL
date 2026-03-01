import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMap } from "../../hooks/useMap";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

// Verificar si el token está configurado
const isTokenConfigured = MAPBOX_TOKEN.length > 0;

if (!isTokenConfigured) {
  console.warn(
    "⚠️ MAPBOX TOKEN NO CONFIGURADO: Por favor configura VITE_MAPBOX_TOKEN en el archivo .env"
  );
}

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [is3D, setIs3D] = useState(false);
  const { setMapInstance } = useMap();

  // Si el token no está configurado, mostrar mensaje de error
  if (!isTokenConfigured) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#f5f5f5",
          color: "#333",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "8px",
            padding: "24px",
            maxWidth: "500px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px 0",
              color: "#856404",
              fontSize: "20px",
            }}
          >
            ⚠️ Token de Mapbox no configurado
          </h2>
          <p style={{ margin: "0 0 12px 0", lineHeight: "1.5" }}>
            Para visualizar el mapa de la Universidad Nacional de Colombia, necesitas
            configurar un token de acceso de Mapbox.
          </p>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              padding: "12px",
              marginTop: "16px",
              textAlign: "left",
            }}
          >
            <strong style={{ display: "block", marginBottom: "8px" }}>
              Pasos para configurar:
            </strong>
            <ol style={{ margin: 0, paddingLeft: "20px" }}>
              <li>Crea una cuenta en <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer">mapbox.com</a></li>
              <li>Copia tu token de acceso público (Public Access Token)</li>
              <li>Crea un archivo <code>.env</code> en la raíz del proyecto frontend</li>
              <li>Agrega la línea: <code>VITE_MAPBOX_TOKEN=tu_token_aqui</code></li>
              <li>Reinicia el servidor de desarrollo</li>
            </ol>
          </div>
          <p
            style={{
              margin: "16px 0 0 0",
              fontSize: "14px",
              color: "#6c757d",
            }}
          >
            <em>Nota: El token de Mapbox tiene un plan gratuito con 50,000 solicitudes mensuales.</em>
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.08175, 4.6351], // UNAL Bogotá
      zoom: 16,
      pitch: 0, // 2D inicialmente
      bearing: 0,
      antialias: true,
      maxBounds: [
        [-74.095, 4.625], // SW
        [-74.070, 4.645], // NE
      ],
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Agregar capa de edificios 3D cuando el mapa cargue
    map.current.on("load", () => {
      if (!map.current) return;

      const layers = map.current.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
      )?.id;

      map.current.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );
    });

    // Guardar instancia del mapa en el store
    map.current.on("load", () => {
      if (map.current) {
        setMapInstance(map.current);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [setMapInstance]);

  const toggle3D = () => {
    if (!map.current) return;

    if (!is3D) {
      map.current.easeTo({ pitch: 60, bearing: -20 });
      setIs3D(true);
    } else {
      map.current.easeTo({ pitch: 0, bearing: 0 });
      setIs3D(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <button
        onClick={toggle3D}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1,
          padding: "10px 16px",
          backgroundColor: "#1e3a5f",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {is3D ? "2D" : "3D"}
      </button>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
