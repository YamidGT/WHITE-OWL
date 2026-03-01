const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coordinates: {
    lng: { type: Number, required: true },
    lat: { type: Number, required: true },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["academic", "cultural", "sports", "social", "other"],
    default: "other",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true,
});

const Event = mongoose.model("Event", eventSchema);

const EventModel = {
  async create(eventData) {
    const event = new Event(eventData);
    return await event.save();
  },

  async findAll() {
    return await Event.find().sort({ createdAt: -1 });
  },

  async findById(id) {
    return await Event.findById(id);
  },

  async update(id, eventData) {
    return await Event.findByIdAndUpdate(id, eventData, { new: true });
  },

  async delete(id) {
    return await Event.findByIdAndDelete(id);
  },

  async findByDateRange(startDate, endDate) {
    return await Event.find({
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });
  },
};

module.exports = EventModel;
