'use strict';

const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const { verifyToken, hashToken } = require('../utils/token');
const { sendError } = require('../utils/response');

/**
 * Middleware to authenticate requests using JWT and check token blacklist.
 * Accepts both "Bearer <token>" (case-insensitive) and raw "<token>".
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.trim()) {
    return sendError(res, 401, 'Authentication required');
  }

  let token = authHeader.trim();

  // If it starts with "Bearer " (case-insensitive), take the part after it
  if (/^bearer(\s+.*)?$/i.test(token)) {
    token = token.replace(/^bearer\s*/i, '').trim();
  }

  if (!token) {
    return sendError(res, 401, 'Authentication required');
  }

  try {
    const decoded = verifyToken(token);

    // Check if token has been blacklisted
    const tokenHash = hashToken(token);
    const isBlacklisted = await BlacklistedToken.findOne({ tokenHash });
    if (isBlacklisted) {
      return sendError(res, 401, 'Token has been revoked.');
    }

    // Attach user to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }

    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp;

    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

module.exports = { authenticate };
