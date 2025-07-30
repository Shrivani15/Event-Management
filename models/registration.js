const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');
const Event = require('./event');

const Registration = sequelize.define('Registration', {}, { timestamps: false });

User.belongsToMany(Event, { through: Registration });
Event.belongsToMany(User, { through: Registration });

module.exports = Registration;