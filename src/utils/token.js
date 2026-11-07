'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user
 * @param {object} user - Mongoose User document or user object
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    accountType: user.accountType,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
};

/**
 * Hash token using SHA-256 for blacklisting
 * @param {string} token - Raw JWT token
 * @returns {string} Hex hash
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = { generateToken, verifyToken, hashToken };
