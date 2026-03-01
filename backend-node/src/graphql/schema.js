const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLSchema } = require("graphql");
const { getEvents, createEvent, deleteEvent } = require("./resolvers");

const EventType = new GraphQLObjectType({
  name: "Event",
  fields: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    coordinates: { type: GraphQLString },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    organizer: { type: GraphQLString },
    category: { type: GraphQLString },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    events: {
      type: new GraphQLList(EventType),
      resolve: getEvents,
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: "RootMutationType",
  fields: {
    createEvent: {
      type: EventType,
      args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        coordinates: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
        organizer: { type: GraphQLString },
        category: { type: GraphQLString },
      },
      resolve: createEvent,
    },
    deleteEvent: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLString },
      },
      resolve: deleteEvent,
    },
  },
});

const graphQLSchema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

module.exports = { graphQLSchema };
