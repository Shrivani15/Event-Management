require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/db');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Test DB Connection
sequelize.authenticate()
  .then(() => console.log('DB connected...'))
  .catch(err => console.error('DB connection failed:', err));

module.exports = app;
