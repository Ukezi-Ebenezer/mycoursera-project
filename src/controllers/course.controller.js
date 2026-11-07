'use strict';

const { getCourses } = require('../services/course.service');
const { sendSuccess } = require('../utils/response');

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

module.exports = {
  getAllCourses,
};
