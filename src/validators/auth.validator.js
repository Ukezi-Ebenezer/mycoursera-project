'use strict';

const Joi = require('joi');
const { ALL_ROLES, ROLES } = require('../constants/roles');

const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name cannot be empty',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email cannot be empty',
  }),
  password: Joi.string().min(8).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
    'string.empty': 'Password cannot be empty',
  }),
  accountType: Joi.string()
    .valid(...ALL_ROLES)
    .default(ROLES.USER)
    .messages({
      'any.only': 'accountType must be one of "User", "Instructor", or "Admin"',
    }),
  instructorCode: Joi.string().trim().optional().allow(''),
  country: Joi.string().trim().optional().allow(''),
  countryCode: Joi.string().trim().optional().allow(''),
  state: Joi.string().trim().optional().allow(''),
  address: Joi.string().trim().optional().allow(''),
  phoneNumber: Joi.string().trim().optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email cannot be empty',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty',
  }),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email cannot be empty',
  }),
  password: Joi.string().min(8).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
    'string.empty': 'Password cannot be empty',
  }),
}).options({ stripUnknown: true });

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email cannot be empty',
  }),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email cannot be empty',
  }),
  otp: Joi.string().trim().required().messages({
    'any.required': 'OTP is required',
    'string.empty': 'OTP cannot be empty',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
};
