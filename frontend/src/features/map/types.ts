import { Marker } from "mapbox-gl";

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  coordinates: Coordinates;
  floors?: number;
  description?: string;
}

export interface POIData {
  id: string;
  name: string;
  type: "water_fountain" | "bathroom" | "food" | "library" | "parking" | "classroom" | "lab" | "office" | "other";
  coordinates: Coordinates;
  buildingId?: string;
  floor?: number;
  description?: string;
}

export interface POI extends POIData {
  marker?: Marker;
}

export interface MapMarker {
  id: string;
  coordinates: Coordinates;
  type: "building" | "poi";
  data: Building | POIData;
}
