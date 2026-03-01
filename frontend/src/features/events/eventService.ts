import { gql } from "@apollo/client";
import graphqlClient from "../../services/graphqlClient";
import { Event, EventInput } from "./types";

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      coordinates {
        lng
        lat
      }
      startDate
      endDate
      organizer
      category
    }
  }
`;

const CREATE_EVENT = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      coordinates {
        lng
        lat
      }
      startDate
      endDate
      organizer
      category
    }
  }
`;

const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const eventService = {
  async getEvents(): Promise<Event[]> {
    const result = await graphqlClient.query({
      query: GET_EVENTS,
      fetchPolicy: "network-only",
    });
    return result.data.events;
  },

  async createEvent(input: EventInput): Promise<Event> {
    const result = await graphqlClient.mutate({
      mutation: CREATE_EVENT,
      variables: { input },
    });
    return result.data.createEvent;
  },

  async deleteEvent(id: string): Promise<boolean> {
    const result = await graphqlClient.mutate({
      mutation: DELETE_EVENT,
      variables: { id },
    });
    return result.data.deleteEvent;
  },
};

export default eventService;
