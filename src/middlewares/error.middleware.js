'use strict';

const { sendError } = require('../utils/response.helper');

/**
 * Global error handler middleware
 * Must be registered last in app.js
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, statusCode, message);
};

module.exports = { errorHandler };
