import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Building, POI } from "./types";

interface MapState {
  mapInstance: any;
  isLoaded: boolean;
  mode: "2D" | "3D";
  selectedPOI: POI | null;
  selectedBuilding: Building | null;
  pois: POI[];
  buildings: Building[];
}

const initialState: MapState = {
  mapInstance: null,
  isLoaded: false,
  mode: "2D",
  selectedPOI: null,
  selectedBuilding: null,
  pois: [],
  buildings: [],
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMap: (state, action: PayloadAction<mapboxgl.Map>) => {
      state.mapInstance = action.payload;
    },
    setMapLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload;
    },
    setMode: (state, action: PayloadAction<"2D" | "3D">) => {
      state.mode = action.payload;
    },
    setSelectedPOI: (state, action: PayloadAction<POI | null>) => {
      state.selectedPOI = action.payload;
    },
    setSelectedBuilding: (state, action: PayloadAction<Building | null>) => {
      state.selectedBuilding = action.payload;
    },
    setPOIs: (state, action: PayloadAction<POI[]>) => {
      state.pois = action.payload;
    },
    addPOI: (state, action: PayloadAction<POI>) => {
      state.pois.push(action.payload);
    },
    removePOI: (state, action: PayloadAction<string>) => {
      state.pois = state.pois.filter((poi) => poi.id !== action.payload);
    },
    setBuildings: (state, action: PayloadAction<Building[]>) => {
      state.buildings = action.payload;
    },
  },
});

export const { setMap, setMapLoaded, setMode, setSelectedPOI, setSelectedBuilding, setPOIs, setBuildings, addPOI, removePOI } = mapSlice.actions;
export default mapSlice.reducer;
