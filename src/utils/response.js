'use strict';

/**
 * Send a standardised success response
 * Shape: { status, message, [data] }
 */
const sendSuccess = (res, statusCode, message, data, extra) => {
  const payload = {
    status: statusCode,
    message,
  };
  if (data !== undefined) {
    payload.data = data;
  }
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
 * Send a standardised error response
 * Shape: { status, message }
 */
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
  });
};

module.exports = { sendSuccess, sendError };
