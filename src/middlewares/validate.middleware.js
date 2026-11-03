'use strict';

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response.helper');

/**
 * Middleware to handle express-validator results
 * Place after validation chains in routes
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return sendError(res, 422, firstError);
  }
  next();
};

module.exports = { validate };
