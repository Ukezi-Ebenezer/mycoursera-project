'use strict';

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

const registerRateLimitMax = parseInt(process.env.REGISTER_RATE_LIMIT_MAX, 10) || 10;
const registerRateLimitWindowMinutes = parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;

const registerLimiter = rateLimit({
  windowMs: registerRateLimitWindowMinutes * 60 * 1000,
  max: registerRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'Too many attempts, please try again later');
  },
});

const generalRateLimitMax = parseInt(process.env.GENERAL_RATE_LIMIT_MAX, 10) || 200;
const generalRateLimitWindowMinutes = parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;

const generalLimiter = rateLimit({
  windowMs: generalRateLimitWindowMinutes * 60 * 1000,
  max: generalRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'Too many requests, please try again later');
  },
});

module.exports = {
  registerLimiter,
  generalLimiter,
};
