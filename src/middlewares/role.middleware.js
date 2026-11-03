'use strict';

const { sendError } = require('../utils/response.helper');

/**
 * Middleware factory — restricts access to specific roles
 * @param {...string} roles - Allowed roles (e.g. 'instructor', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden. You do not have permission to perform this action.');
    }
    next();
  };
};

module.exports = { authorize };
