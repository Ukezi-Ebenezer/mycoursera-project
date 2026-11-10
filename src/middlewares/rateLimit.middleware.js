'use strict';

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;
const { sendError } = require('../utils/response');

const registerRateLimitMax = parseInt(process.env.REGISTER_RATE_LIMIT_MAX, 10) || 10;
const registerRateLimitWindowMinutes = parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;

const loginRateLimitMax = parseInt(process.env.LOGIN_RATE_LIMIT_MAX, 10) || 10;
const loginRateLimitWindowMinutes = parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;

const passwordRateLimitMax = parseInt(process.env.PASSWORD_RATE_LIMIT_MAX, 10) || 5;
const passwordRateLimitWindowMinutes = parseInt(process.env.PASSWORD_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;

const courseWriteRateLimitMax = parseInt(process.env.COURSE_WRITE_RATE_LIMIT_MAX, 10) || 60;
const courseWriteRateLimitWindowMinutes = parseInt(process.env.COURSE_WRITE_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;

const enrollRateLimitMax = parseInt(process.env.ENROLL_RATE_LIMIT_MAX, 10) || 20;
const enrollRateLimitWindowMinutes = parseInt(process.env.ENROLL_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;

const generalRateLimitMax = parseInt(process.env.GENERAL_RATE_LIMIT_MAX, 10) || 200;
const generalRateLimitWindowMinutes = parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;

const registerLimiter = rateLimit({
  windowMs: registerRateLimitWindowMinutes * 60 * 1000,
  max: registerRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'Too many attempts, please try again later');
  },
});

const loginLimiter = rateLimit({
  windowMs: loginRateLimitWindowMinutes * 60 * 1000,
  max: loginRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email =
      req.body && typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
    const ip = ipKeyGenerator(req.ip || '127.0.0.1');
    return `${ip}_${email}`;
  },
  handler: (req, res) => {
    return sendError(res, 429, 'Too many attempts, please try again later');
  },
});

const passwordLimiter = rateLimit({
  windowMs: passwordRateLimitWindowMinutes * 60 * 1000,
  max: passwordRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'Too many attempts, please try again later');
  },
});

const courseWriteLimiter = rateLimit({
  windowMs: courseWriteRateLimitWindowMinutes * 60 * 1000,
  max: courseWriteRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user
      ? (req.user._id || req.user.id)?.toString()
      : ipKeyGenerator(req.ip || '127.0.0.1');
    return `course_write_${userId}`;
  },
  handler: (req, res) => {
    return sendError(res, 429, 'Too many attempts, please try again later');
  },
});

const enrollLimiter = rateLimit({
  windowMs: enrollRateLimitWindowMinutes * 60 * 1000,
  max: enrollRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user
      ? (req.user._id || req.user.id)?.toString()
      : ipKeyGenerator(req.ip || '127.0.0.1');
    return `enroll_${userId}`;
  },
  handler: (req, res) => {
    return sendError(res, 429, 'Too many attempts, please try again later');
  },
});

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
  loginLimiter,
  passwordLimiter,
  courseWriteLimiter,
  enrollLimiter,
  generalLimiter,
};
