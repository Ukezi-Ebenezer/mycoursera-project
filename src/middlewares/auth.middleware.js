'use strict';

const { verifyToken } = require('../utils/token.helper');
const { sendError } = require('../utils/response.helper');

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

module.exports = { authenticate };
