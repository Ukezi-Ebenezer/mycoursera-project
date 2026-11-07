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

/**
 * Reusable middleware to validate req.params using Joi
 * Strips unknown fields, returns 400 on failure,
 * and attaches cleaned values to req.validatedParams.
 * Rejects injection characters ($ or .) and non-string/nested structures with 400.
 *
 * @param {object} schema - Joi schema object
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    for (const [key, value] of Object.entries(req.params || {})) {
      if (typeof key === 'string' && (key.startsWith('$') || key.includes('.'))) {
        return sendError(res, 400, `Invalid parameter "${key}"`);
      }
      if (typeof value === 'string' && (value.includes('$') || value.includes('.'))) {
        return sendError(res, 400, 'Invalid course id');
      }
      if (typeof value === 'object' && value !== null) {
        return sendError(res, 400, 'Invalid course id');
      }
    }

    if (!schema || typeof schema.validate !== 'function') {
      return next();
    }

    const { error, value } = schema.validate(req.params, {
      stripUnknown: true,
      abortEarly: true,
    });

    if (error) {
      const message =
        error.details && error.details.length > 0
          ? error.details[0].message
          : 'Invalid course id';
      return sendError(res, 400, message);
    }

    req.validatedParams = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
};

