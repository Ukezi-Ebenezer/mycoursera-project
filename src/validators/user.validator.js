'use strict';

const Joi = require('joi');

const updateUserSchema = Joi.object({
  first_name: Joi.string().trim().optional(),
  last_name: Joi.string().trim().optional().allow(''),
  email: Joi.string().email().lowercase().trim().optional().messages({
    'string.email': 'Please provide a valid email address',
  }),
  phone_number: Joi.string().trim().optional().allow(''),
  country: Joi.string().trim().optional().allow(''),
  state: Joi.string().trim().optional().allow(''),
  countryCode: Joi.string().trim().optional().allow(''),
  occupation: Joi.string().trim().optional().allow(''),
  address: Joi.string().trim().optional().allow(''),
  dateOfBirth: Joi.date().iso().max('now').optional().allow(null, '').messages({
    'date.max': 'Date of birth cannot be in the future',
    'date.format': 'Date of birth must be a valid ISO date',
    'date.base': 'Date of birth must be a valid ISO date',
  }),
}).options({ stripUnknown: true });

module.exports = { updateUserSchema };
