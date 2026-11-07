'use strict';

const { sendError } = require('../utils/response');

/**
 * Middleware factory to restrict access based on allowed user roles / accountType
 * @param {...string} allowedRoles - Roles permitted to access the route
 */
const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    const userRole = req.user?.accountType || req.user?.role;

    if (!req.user || !roles.includes(userRole)) {
      return sendError(res, 403, 'Access denied: insufficient permissions');
    }

    next();
  };
};

module.exports = { authorize };
