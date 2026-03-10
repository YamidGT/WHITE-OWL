import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Building, POI } from "./types";

interface MapState {
  mapInstance: any;
  isLoaded: boolean;
  mode: "2D" | "3D";
  selectedPOI: Omit<POI, "marker"> | null;
  selectedBuilding: Building | null;
  pois: Omit<POI, "marker">[];
  buildings: Building[];
  userLocation: { lat: number; lng: number } | null;
}

const initialState: MapState = {
  mapInstance: null,
  isLoaded: false,
  mode: "2D",
  selectedPOI: null,
  selectedBuilding: null,
  pois: [],
  buildings: [],
  userLocation: null,
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMap: (state, action: PayloadAction<any>) => {
      state.mapInstance = action.payload;
    },
    setMapLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload;
    },
    setMode: (state, action: PayloadAction<"2D" | "3D">) => {
      state.mode = action.payload;
    },
    setSelectedPOI: (state, action: PayloadAction<Omit<POI, "marker"> | null>) => {
      state.selectedPOI = action.payload;
    },
    setSelectedBuilding: (state, action: PayloadAction<Building | null>) => {
      state.selectedBuilding = action.payload;
    },
    setPOIs: (state, action: PayloadAction<Omit<POI, "marker">[]>) => {
      state.pois = action.payload;
    },
    addPOI: (state, action: PayloadAction<Omit<POI, "marker">>) => {
      state.pois.push(action.payload);
    },
    removePOI: (state, action: PayloadAction<string>) => {
      state.pois = state.pois.filter((poi) => poi.id !== action.payload);
    },
    setBuildings: (state, action: PayloadAction<Building[]>) => {
      state.buildings = action.payload;
    },
    setUserLocation: (
      state,
      action: PayloadAction<{ lat: number; lng: number } | null>
    ) => {
      state.userLocation = action.payload;
    }
  },
});

export const { setMap, setMapLoaded, setMode, setSelectedPOI, setSelectedBuilding, setPOIs, setBuildings, addPOI, removePOI, setUserLocation } = mapSlice.actions;
export default mapSlice.reducer;
