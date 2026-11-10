'use strict';

const { enrollInCourse, completeCourse } = require('../services/enrollment.service');
const { enrollCourseBodySchema, completeCourseBodySchema } = require('../validators/enrollment.validator');
const { toEnrollmentResponse, toCompletionResponse } = require('../utils/enrollment');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Controller to enroll the authenticated user into a course.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const enrollCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Reject boolean values for amount before Joi conversion
    if (typeof req.body?.amount === 'boolean') {
      return sendError(res, 400, 'amount must be a number');
    }

    // Validate request body with Joi
    const { error, value } = enrollCourseBodySchema.validate(req.body || {}, {
      abortEarly: true,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    // If courseId is provided in the body, it must equal the route param :id
    if (value.courseId && value.courseId !== id) {
      return sendError(res, 400, 'courseId in body does not match the URL');
    }

    const enrollment = await enrollInCourse({
      courseId: id,
      amount: value.amount,
      user: req.user,
    });

    return sendSuccess(res, 200, 'Course enrolled successfully', [
      toEnrollmentResponse(enrollment),
    ]);
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    next(err);
  }
};

/**
 * Controller to mark a course as completed for the authenticated user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const completeCourseHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body with Joi
    const { error, value } = completeCourseBodySchema.validate(req.body || {}, {
      abortEarly: true,
      stripUnknown: true,
    });

    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    const { enrollment, course } = await completeCourse({
      courseId: id,
      isCompleted: value.isCompleted,
      user: req.user,
    });

    return sendSuccess(
      res,
      200,
      'Course successfully marked',
      toCompletionResponse(enrollment, course)
    );
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    next(err);
  }
};

module.exports = {
  enrollCourse,
  completeCourse: completeCourseHandler,
};
