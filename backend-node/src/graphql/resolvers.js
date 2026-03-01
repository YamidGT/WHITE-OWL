const eventService = require("../services/event.service");

const getEvents = async () => {
  try {
    const events = await eventService.getEvents();
    return events;
  } catch (error) {
    throw new Error("Error fetching events: " + error.message);
  }
};

const createEvent = async (args) => {
  try {
    const eventData = {
      title: args.title,
      description: args.description,
      coordinates: JSON.parse(args.coordinates),
      startDate: new Date(args.startDate),
      endDate: new Date(args.endDate),
      organizer: args.organizer,
      category: args.category || "other",
    };
    
    eventService.validateEventData(eventData);
    const event = await eventService.createEvent(eventData);
    return event;
  } catch (error) {
    throw new Error("Error creating event: " + error.message);
  }
};

const deleteEvent = async (args) => {
  try {
    await eventService.deleteEvent(args.id);
    return "Event deleted successfully";
  } catch (error) {
    throw new Error("Error deleting event: " + error.message);
  }
};

module.exports = {
  getEvents,
  createEvent,
  deleteEvent,
};
