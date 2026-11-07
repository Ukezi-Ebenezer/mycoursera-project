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

const courseIdParamSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.base': 'Invalid course id',
      'string.hex': 'Invalid course id',
      'string.length': 'Invalid course id',
      'any.required': 'Invalid course id',
    }),
}).options({ stripUnknown: true });

const updateCourseSchema = Joi.object({
  title: Joi.string().trim().min(1).optional().messages({
    'string.base': 'title must be a string',
    'string.empty': 'title cannot be empty',
  }),
  description: Joi.string().trim().min(1).optional().messages({
    'string.base': 'description must be a string',
    'string.empty': 'description cannot be empty',
  }),
  price: Joi.number().min(0).optional().messages({
    'number.base': 'price must be a number',
    'number.min': 'price cannot be negative',
  }),
  tags: Joi.array()
    .items(
      Joi.string().trim().min(1).messages({
        'string.base': 'tag must be a string',
        'string.empty': 'tag cannot be empty',
      })
    )
    .max(10)
    .custom((value) => {
      if (Array.isArray(value)) {
        return [...new Set(value.map((t) => (typeof t === 'string' ? t.trim() : t)))];
      }
      return value;
    })
    .optional()
    .messages({
      'array.base': 'tags must be an array',
      'array.max': 'tags cannot exceed 10 items',
    }),
  level: Joi.string().trim().min(1).optional().messages({
    'string.base': 'level must be a string',
    'string.empty': 'level cannot be empty',
  }),
  category: Joi.string().trim().min(1).optional().messages({
    'string.base': 'category must be a string',
    'string.empty': 'category cannot be empty',
  }),
  duration: Joi.string().trim().min(1).optional().messages({
    'string.base': 'duration must be a string',
    'string.empty': 'duration cannot be empty',
  }),
  availability: Joi.boolean().optional().messages({
    'boolean.base': 'availability must be a boolean (true or false)',
  }),
})
  .min(1)
  .required()
  .messages({
    'object.min': 'No valid fields to update',
    'any.required': 'No valid fields to update',
  })
  .options({ stripUnknown: true, convert: true, abortEarly: true });

module.exports = {
  getCoursesQuerySchema,
  courseIdParamSchema,
  updateCourseSchema,
};
