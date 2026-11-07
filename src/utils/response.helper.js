'use strict';

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response payload
 */
const sendSuccess = (res, statusCode, message, data = {}, extra) => {
  const payload = {
    status: statusCode,
    message,
    data,
  };
  if (extra !== undefined) {
    if (typeof extra === 'object' && extra !== null && !extra.pagination && (extra.page !== undefined || extra.totalItems !== undefined)) {
      payload.pagination = extra;
    } else if (typeof extra === 'object' && extra !== null) {
      Object.assign(payload, extra);
    }
  }
  return res.status(statusCode).json(payload);
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
  });
};

module.exports = { sendSuccess, sendError };

