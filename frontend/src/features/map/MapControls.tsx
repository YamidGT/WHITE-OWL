import { useState } from "react";
import { useMap } from "../../hooks/useMap";

export default function MapControls() {
  const { getMapInstance, setMapMode } = useMap();
  const [is3D, setIs3D] = useState(false);

  const toggle3D = () => {
    const map = getMapInstance();
    if (!map) return;

    if (!is3D) {
      map.easeTo({ pitch: 60, bearing: -20 });
      setMapMode("3D");
      setIs3D(true);
    } else {
      map.easeTo({ pitch: 0, bearing: 0 });
      setMapMode("2D");
      setIs3D(false);
    }
  };

  const resetView = () => {
    const map = getMapInstance();
    if (!map) return;

    map.flyTo({
      center: [-74.08175, 4.6351],
      zoom: 16,
      pitch: 0,
      bearing: 0,
    });
    setIs3D(false);
    setMapMode("2D");
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 1,
      }}
    >
      <button
        onClick={toggle3D}
        style={{
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
      <button
        onClick={resetView}
        style={{
          padding: "10px 16px",
          backgroundColor: "#ffffff",
          color: "#1e3a5f",
          border: "2px solid #1e3a5f",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        ↺
      </button>
    </div>
  );
}
