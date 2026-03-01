import { Coordinates } from "../features/map/types";

export interface Building {
  id: string;
  name: string;
  code: string;
  coordinates: Coordinates;
  floors?: number;
  description?: string;
}

export default Building;
