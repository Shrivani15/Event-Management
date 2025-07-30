const Event = require('../models/event');
const User = require('../models/user');
const Registration = require('../models/registration');
const { Op } = require('sequelize');

module.exports = {
  createEvent: async (req, res) => {
    try {
      const { title, datetime, location, capacity } = req.body;
      if (!title || !datetime || !location || !capacity || capacity <= 0 || capacity > 1000)
        return res.status(400).json({ message: 'Invalid input' });
      const event = await Event.create({ title, datetime, location, capacity });
      res.status(201).json({ eventId: event.id });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  getEventDetails: async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id, {
        include: [{ model: User, through: { attributes: [] } }]
      });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      res.json(event);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  registerUser: async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id, {
        include: [{ model: User, through: { attributes: [] } }]
      });
      const { userId } = req.body;
      if (!event) return res.status(404).json({ message: 'Event not found' });
      if (new Date(event.datetime) < new Date()) return res.status(400).json({ message: 'Event has already occurred' });
      if (event.Users.length >= event.capacity) return res.status(400).json({ message: 'Event is full' });
      const alreadyRegistered = event.Users.find(u => u.id === userId);
      if (alreadyRegistered) return res.status(409).json({ message: 'User already registered' });
      await Registration.create({ EventId: event.id, UserId: userId });
      res.json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  cancelRegistration: async (req, res) => {
    try {
      const { id, userId } = req.params;
      const deleted = await Registration.destroy({ where: { EventId: id, UserId: userId } });
      if (!deleted) return res.status(404).json({ message: 'User not registered for this event' });
      res.json({ message: 'Registration cancelled' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  listUpcomingEvents: async (req, res) => {
    try {
      const now = new Date();
      const events = await Event.findAll({
        where: { datetime: { [Op.gt]: now } },
        order: [['datetime', 'ASC'], ['location', 'ASC']]
      });
      res.json(events);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  getEventStats: async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id, {
        include: [{ model: User, through: { attributes: [] } }]
      });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      const total = event.Users.length;
      const remaining = event.capacity - total;
      const percentage = ((total / event.capacity) * 100).toFixed(2);
      res.json({ total, remaining, percentage: `${percentage}%` });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};