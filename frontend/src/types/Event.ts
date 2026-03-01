import { Coordinates } from "../features/map/types";

export interface Event {
  id: string;
  title: string;
  description: string;
  coordinates: Coordinates;
  startDate: string;
  endDate: string;
  organizer: string;
  category: "academic" | "cultural" | "sports" | "social" | "other";
  createdAt: string;
  updatedAt: string;
}

export default Event;
