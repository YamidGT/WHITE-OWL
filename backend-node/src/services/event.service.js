const { Event } = require("../models/event.model");

const createEvent = async (eventData) => {
  const event = await Event.create(eventData);
  return event;
};

const getEvents = async () => {
  const events = await Event.findAll();
  return events;
};

const getEventById = async (id) => {
  const event = await Event.findById(id);
  return event;
};

const updateEvent = async (id, eventData) => {
  const event = await Event.update(id, eventData);
  return event;
};

const deleteEvent = async (id) => {
  await Event.delete(id);
};

const validateEventData = (eventData) => {
  const { title, description, coordinates, startDate, endDate } = eventData;
  
  if (!title || !description || !coordinates || !startDate || !endDate) {
    throw new Error("Faltan datos requeridos para el evento");
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
  }
  
  return true;
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  validateEventData,
};
