const typeDefs = `
  type Event {
    id: ID!
    title: String!
    description: String!
    coordinates: Coordinates!
    startDate: String!
    endDate: String!
    organizer: String!
    category: String!
    createdAt: String
    updatedAt: String
  }

  type Coordinates {
    lng: Float!
    lat: Float!
  }

  input EventInput {
    title: String!
    description: String!
    coordinates: CoordinatesInput!
    startDate: String!
    endDate: String!
    organizer: String!
    category: String
  }

  input CoordinatesInput {
    lng: Float!
    lat: Float!
  }

  type Query {
    events: [Event!]!
    event(id: ID!): Event
  }

  type Mutation {
    createEvent(input: EventInput!): Event!
    updateEvent(id: ID!, input: EventInput!): Event
    deleteEvent(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
