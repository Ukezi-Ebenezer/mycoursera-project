'use strict';

const { sendError } = require('../utils/response');

/**
 * Global error handler middleware
 * Must be registered last in app.js
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const isProduction = process.env.NODE_ENV === 'production';

  // Server-side logging
  if (!isProduction) {
    console.error(err.stack || err);
  } else {
    console.error(`[Error] ${err.name || 'Error'}: ${err.message || 'Internal Server Error'}`);
  }

  // Handle body-parser 100kb payload limit exceeded
  if (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413) {
    return sendError(res, 413, 'Payload too large');
  }

  // Handle Mongoose CastError without exposing internal paths or Mongoose error text
  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid resource identifier');
  }

  // Handle Mongoose ValidationError without exposing internal schema details
  if (err.name === 'ValidationError') {
    return sendError(res, 400, 'Validation error');
  }

  const statusCode = err.status || err.statusCode || 500;

  // Never return stack traces, internal paths, or exception text for 500 errors
  let message = err.message || 'Internal Server Error';
  if (statusCode >= 500) {
    message = 'Internal Server Error';
  }

  return sendError(res, statusCode, message);
};

module.exports = { errorHandler };

