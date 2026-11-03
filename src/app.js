'use strict';

const express = require('express');

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 200, message: 'E-Learning API is running' });
});

// TODO: Mount routes here as they are built

// Error handler (must be last)
// const { errorHandler } = require('./middlewares/error.middleware');
// app.use(errorHandler);

module.exports = app;
