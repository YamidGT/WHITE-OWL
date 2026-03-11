import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMap } from "../../hooks/useMap";
import { setUserLocation } from "./mapSlice";

export default function MapControls() {
  const { getMapInstance, setMapMode, flyToLocation } = useMap();
  const dispatch = useDispatch();
  const [is3D, setIs3D] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

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

  const goToCoords = () => {
    const nlat = parseFloat(lat);
    const nlng = parseFloat(lng);
    if (!isNaN(nlat) && !isNaN(nlng)) {
      flyToLocation(nlat, nlng);
      dispatch(setUserLocation({ lat: nlat, lng: nlng }));
      setLat("");
      setLng("");
    }
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

      {/* Controles para coordenadas manuales */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "12px",
          backgroundColor: "#ffffff",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <label
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            color: "#1e3a5f",
          }}
        >
          Ir a coordenadas
        </label>
        <input
          type="number"
          placeholder="Latitud"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          step="0.0001"
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "12px",
          }}
        />
        <input
          type="number"
          placeholder="Longitud"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          step="0.0001"
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "12px",
          }}
        />
        <button
          onClick={goToCoords}
          disabled={!lat || !lng}
          style={{
            padding: "8px",
            backgroundColor: lat && lng ? "#1e3a5f" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: lat && lng ? "pointer" : "not-allowed",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          Ir
        </button>
      </div>
    </div>
  );
}
