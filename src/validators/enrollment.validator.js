'use strict';

const Joi = require('joi');

const enrollCourseBodySchema = Joi.object({
  amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'amount is required',
      'number.base': 'amount must be a number',
      'number.min': 'amount cannot be negative',
    }),
  courseId: Joi.string()
    .hex()
    .length(24)
    .optional()
    .messages({
      'string.base': 'courseId in body does not match the URL',
      'string.hex': 'courseId in body does not match the URL',
      'string.length': 'courseId in body does not match the URL',
    }),
}).options({ stripUnknown: true, convert: true, abortEarly: true });

const completeCourseBodySchema = Joi.object({
  isCompleted: Joi.boolean()
    .strict()
    .required()
    .messages({
      'any.required': 'isCompleted is required',
      'boolean.base': 'isCompleted must be a boolean',
    }),
}).options({ stripUnknown: true, abortEarly: true });

module.exports = {
  enrollCourseBodySchema,
  completeCourseBodySchema,
};
