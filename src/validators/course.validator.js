'use strict';

const Joi = require('joi');

const getCoursesQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'page must be a number',
      'number.integer': 'page must be an integer',
      'number.min': 'page must be 0 or greater',
    }),
  size: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'size must be a number',
      'number.integer': 'size must be an integer',
      'number.min': 'size must be between 1 and 100',
      'number.max': 'size must be between 1 and 100',
    }),
  q: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'q must be a string',
      'string.max': 'q cannot exceed 100 characters',
    }),
  category: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'category must be a string',
    }),
  level: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'level must be a string',
    }),
  availability: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'availability must be a boolean (true or false)',
    }),
  sort: Joi.string()
    .valid('createdAt', 'price', 'title')
    .default('createdAt')
    .messages({
      'string.base': 'sort must be a string',
      'any.only': 'sort must be one of createdAt, price, title',
    }),
  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'string.base': 'order must be a string',
      'any.only': 'order must be either asc or desc',
    }),
}).options({ stripUnknown: true });

module.exports = {
  getCoursesQuerySchema,
};
