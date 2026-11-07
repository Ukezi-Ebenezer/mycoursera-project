'use strict';

/**
 * Formats a course document or lean object into a safe public API response.
 * Excludes _id, __v and limits instructor to its ID string.
 *
 * @param {object} course - Mongoose course document or lean object
 * @returns {object} Formatted course object
 */
const toCourseResponse = (course) => {
  if (!course) return null;

  const id = course._id
    ? course._id.toString()
    : course.id
    ? course.id.toString()
    : undefined;

  let instructorId;
  if (course.instructor) {
    if (typeof course.instructor === 'object' && course.instructor._id) {
      instructorId = course.instructor._id.toString();
    } else {
      instructorId = course.instructor.toString();
    }
  }

  return {
    id,
    title: course.title,
    description: course.description,
    price: course.price,
    tags: Array.isArray(course.tags) ? course.tags : [],
    category: course.category,
    level: course.level,
    availability: course.availability,
    instructor: instructorId,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
};

module.exports = {
  toCourseResponse,
};
