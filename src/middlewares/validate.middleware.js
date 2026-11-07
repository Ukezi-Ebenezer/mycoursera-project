'use strict';

const { sendError } = require('../utils/response');

/**
 * Reusable middleware to validate request body using Joi
 * @param {object} schema - Joi schema object
 */
const validate = (schema) => {
  return (req, res, next) => {
    if (!schema || typeof schema.validate !== 'function') {
      return next();
    }
    const { error, value } = schema.validate(req.body, {
      stripUnknown: true,
      abortEarly: true,
    });
    if (error) {
      const message = error.details && error.details.length > 0
        ? error.details[0].message
        : 'Validation error';
      return sendError(res, 400, message);
    }
    req.body = value;
    next();
  };
};

/**
 * Reusable middleware to validate req.query using Joi
 * Strips unknown fields, converts types, returns 400 on failure,
 * and attaches cleaned values to req.validatedQuery (without modifying req.query).
 * Rejects nested objects, arrays, and injection keys with 400.
 *
 * @param {object} schema - Joi schema object
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    // Reject bracket notation, injection keys, or nested objects
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key.includes('[') || key.includes(']') || key.startsWith('$') || key.includes('.')) {
        return sendError(res, 400, `Invalid query parameter "${key}"`);
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return sendError(res, 400, `Invalid query parameter "${key}": objects are not allowed`);
      }
    }

    const { error, value } = schema.validate(req.query, {
      stripUnknown: true,
      convert: true,
      abortEarly: true,
    });

    if (error) {
      const message = error.details && error.details.length > 0
        ? error.details[0].message
        : 'Invalid query parameters';
      return sendError(res, 400, message);
    }

    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
};

