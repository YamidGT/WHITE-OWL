import { Coordinates } from "../map/types";

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

export interface EventInput {
  title: string;
  description: string;
  coordinates: Coordinates;
  startDate: string;
  endDate: string;
  organizer: string;
  category: Event["category"];
}
