import mapboxgl from "mapbox-gl";
import { POI, Building, Coordinates } from "./types";

// Token de Mapbox - debe definirse en variable de entorno
const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
mapboxgl.accessToken = TOKEN;

// Centro de la UNAL Bogotá
export const UNAL_CENTER: Coordinates = {
  lng: -74.08175,
  lat: 4.6351,
};

// Límites del mapa (solo área de la UNAL)
export const UNAL_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-74.095, 4.625], // SW
  [-74.070, 4.645], // NE
];

export const mapService = {
  /**
   * Inicializa el mapa centrado en la UNAL
   */
  initializeMap: (
    container: HTMLDivElement,
    options?: Partial<mapboxgl.MapOptions>
  ): mapboxgl.Map => {
    return new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [UNAL_CENTER.lng, UNAL_CENTER.lat],
      zoom: 16,
      pitch: 0,
      bearing: 0,
      antialias: true,
      maxBounds: UNAL_BOUNDS,
      ...options,
    });
  },

  /**
   * Agrega marcadores de POIs al mapa
   */
  addPOIMarkers: (map: mapboxgl.Map, pois: POI[]): mapboxgl.Marker[] => {
    const markers: mapboxgl.Marker[] = [];

    pois.forEach((poi) => {
      const el = document.createElement("div");
      el.className = `poi-marker poi-${poi.type}`;
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = mapService.getPOIColor(poi.type);
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([poi.coordinates.lng, poi.coordinates.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${poi.name}</h3><p>${poi.description || poi.type}</p>`
          )
        )
        .addTo(map);

      markers.push(marker);
    });

    return markers;
  },

  /**
   * Obtiene el color según el tipo de POI
   */
  getPOIColor: (type: POI["type"]): string => {
    const colors: Record<POI["type"], string> = {
      water_fountain: "#3498db",
      bathroom: "#9b59b6",
      food: "#e74c3c",
      library: "#2ecc71",
      parking: "#f39c12",
      classroom: "#1abc9c",
      lab: "#e67e22",
      office: "#34495e",
      other: "#95a5a6",
    };
    return colors[type] || "#95a5a6";
  },

  /**
   * Centra el mapa en una ubicación específica
   */
  flyTo: (map: mapboxgl.Map, coordinates: Coordinates, zoom?: number) => {
    map.flyTo({
      center: [coordinates.lng, coordinates.lat],
      zoom: zoom || 16,
      essential: true,
    });
  },

  /**
   * Cambia entre modo 2D y 3D
   */
  toggle3D: (map: mapboxgl.Map, enable3D: boolean) => {
    if (enable3D) {
      map.easeTo({ pitch: 60, bearing: -20 });
    } else {
      map.easeTo({ pitch: 0, bearing: 0 });
    }
  },
};

export default mapService;
