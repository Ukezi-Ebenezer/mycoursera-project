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

  const statusCode = err.status || err.statusCode || 500;

  // Never return stack traces or internal messages in production for 500 errors
  let message = err.message || 'Internal Server Error';
  if (isProduction && statusCode >= 500) {
    message = 'Internal Server Error';
  }

  return sendError(res, statusCode, message);
};

module.exports = { errorHandler };

