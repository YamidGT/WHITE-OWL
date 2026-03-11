import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { setMap, setMode, addPOI, removePOI, setSelectedBuilding, setUserLocation } from "../features/map/mapSlice";
import mapboxgl from "mapbox-gl";
import type { RootState } from "../app/store";
import type { POI, Building } from "../features/map/types";

let mapInstance: mapboxgl.Map | null = null;
const poiMarkers = new Map<string, mapboxgl.Marker>();  // Mantener referencias a marcadores localmente

export const useMap = () => {
  const dispatch = useDispatch();
  const { pois, buildings, selectedBuilding, mode } = useSelector(
    (state: RootState) => state.map
  );

  const setMapInstance = useCallback((map: mapboxgl.Map) => {
    mapInstance = map;
    dispatch(setMap(map));
  }, [dispatch]);

  const setMapMode = (newMode: "2D" | "3D") => {
    dispatch(setMode(newMode));
    
    if (mapInstance) {
      if (newMode === "3D") {
        mapInstance.easeTo({
          pitch: 60,
          bearing: -20,
        });
      } else {
        mapInstance.easeTo({
          pitch: 0,
          bearing: 0,
        });
      }
    }
  };

  const getMapInstance = () => mapInstance;

  const addPOIToMap = (poi: POI) => {
    if (!mapInstance) return;

    // Create marker element
    const el = document.createElement("div");
    el.className = `poi-marker poi-${poi.type}`;
    el.style.width = "30px";
    el.style.height = "30px";
    el.style.borderRadius = "50%";
    el.style.cursor = "pointer";
    
    // Set color based on POI type
    const colors: Record<string, string> = {
      water_dispenser: "#3B82F6",
      restroom: "#8B5CF6",
      cafeteria: "#F59E0B",
      library: "#10B981",
      laboratory: "#EF4444",
      parking: "#6B7280",
      entrance: "#059669",
      exit: "#DC2626",
      emergency: "#FF0000",
      info: "#06B6D4",
    };
    el.style.backgroundColor = colors[poi.type] || "#6B7280";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<div class="p-2">
        <h3 class="font-bold text-gray-800">${poi.name}</h3>
        <p class="text-sm text-gray-600">${poi.description || poi.type.replace("_", " ")}</p>
      </div>`
    );

    const marker = new mapboxgl.Marker(el)
      .setLngLat([poi.coordinates.lng, poi.coordinates.lat])
      .setPopup(popup)
      .addTo(mapInstance);

    // Guardar referencias al marcador localmente (no en Redux)
    poiMarkers.set(poi.id, marker);
    
    // Guardar POI en Redux sin el marcador
    const { marker: _, ...poiWithoutMarker } = poi;
    dispatch(addPOI(poiWithoutMarker));
  };

  const removePOIFromMap = (poiId: string) => {
    // Remover marcador del mapa usando la referencia local
    const marker = poiMarkers.get(poiId);
    if (marker) {
      marker.remove();
      poiMarkers.delete(poiId);
    }
    // Remover POI de Redux
    dispatch(removePOI(poiId));
  };

  const selectBuilding = (building: Building | null) => {
    dispatch(setSelectedBuilding(building));
    
    if (mapInstance && building) {
      mapInstance.flyTo({
        center: [building.coordinates.lng, building.coordinates.lat],
        zoom: 18,
        essential: true,
      });
    }
  };

  const fitToAllPOIs = () => {
    if (!mapInstance || pois.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    pois.forEach((poi) => {
      bounds.extend([poi.coordinates.lng, poi.coordinates.lat]);
    });

    mapInstance.fitBounds(bounds, {
      padding: 50,
      maxZoom: 17,
    });
  };

  const flyToLocation = (lat: number, lng: number, zoom: number = 16) => {
    if (!mapInstance) return;
    
    mapInstance.flyTo({
      center: [lng, lat],
      zoom,
      essential: true,
    });
  };

  const setUserLocationOnState =(coords : {lat: number, lng:number} | null) => {
    dispatch(setUserLocation(coords));
  };

  const getUserLocation = () => {
    // Los datos de ubicación se leen desde Redux usando useSelector en los componentes
    // No se pueden acceder directamente desde el hook
    return null;
  };

  return {
    setMapInstance,
    setMapMode,
    getMapInstance,
    addPOIToMap,
    removePOIFromMap,
    selectBuilding,
    fitToAllPOIs,
    flyToLocation,
    pois,
    buildings,
    selectedBuilding,
    mode,
    setUserLocation: setUserLocationOnState,
    getUserLocation,
  };

};
