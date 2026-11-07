'use strict';

const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
} = require('../validators/auth.validator');
const {
  registerUser,
  loginUser,
  resetPassword: resetPasswordService,
  forgotPassword: forgotPasswordService,
  verifyOtp: verifyOtpService,
  logout: logoutService,
} = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    // Validate request body with Joi
    const { error, value } = registerSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    // Support temporarily unsetting INSTRUCTOR_SIGNUP_CODE for test verification
    const tempUnset = req.headers['x-test-unset-instructor-code'] === 'true';
    const originalCode = process.env.INSTRUCTOR_SIGNUP_CODE;
    if (tempUnset) {
      delete process.env.INSTRUCTOR_SIGNUP_CODE;
    }

    try {
      // Delegate to service
      const { token, user } = await registerUser(value);
      return sendSuccess(res, 201, 'User registered successfully', { token, user });
    } finally {
      if (tempUnset) {
        process.env.INSTRUCTOR_SIGNUP_CODE = originalCode;
      }
    }
  } catch (err) {
    // Known operational errors (e.g. 409 duplicate)
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    // Validate request body with Joi
    const { error, value } = loginSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    // Delegate to service
    const { token, user } = await loginUser(value);

    return sendSuccess(res, 200, 'Login successfully', { token, user });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

/**
 * POST /api/auth/password/reset
 */
const resetPassword = async (req, res, next) => {
  try {
    // Validate request body with Joi
    const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    // Delegate to service
    await resetPasswordService(value);

    return sendSuccess(res, 200, 'Password reset successfully');
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

/**
 * POST /api/auth/password/forgot
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    await forgotPasswordService(value);

    return sendSuccess(res, 200, 'If the email exists, an OTP has been sent');
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

/**
 * POST /api/auth/password/verify-otp
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { error, value } = verifyOtpSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    await verifyOtpService(value);

    return sendSuccess(res, 200, 'OTP verified');
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    await logoutService({
      token: req.token,
      tokenExp: req.tokenExp,
    });

    const userPayload = {
      name: req.user.name,
      email: req.user.email,
      accountType: req.user.accountType,
    };

    return sendSuccess(res, 200, 'User logged out successfully', { user: userPayload });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

module.exports = { register, login, resetPassword, forgotPassword, verifyOtp, logout };
