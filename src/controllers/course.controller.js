'use strict';

const { getCourses, getCourseById, updateCourse } = require('../services/course.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Controller to retrieve a paginated, filtered list of courses
 */
const getAllCourses = async (req, res, next) => {
  try {
    const query = req.validatedQuery || req.query;
    const { courses, pagination } = await getCourses(query, req.user);

    return sendSuccess(
      res,
      200,
      'Retrieved all courses successfully',
      courses,
      { pagination }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to retrieve a single course by ID
 */
const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await getCourseById(id, req.user);

    return sendSuccess(res, 200, 'Course retrieved successfully', course);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * Controller to update an existing course by ID
 */
const updateCourseHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const course = await updateCourse(id, updateData, req.user);

    return sendSuccess(res, 200, 'Course edited successfully', course);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  updateCourse: updateCourseHandler,
};
