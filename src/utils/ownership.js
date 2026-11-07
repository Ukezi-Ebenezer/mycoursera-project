'use strict';

const { ROLES } = require('../constants/roles');

/**
 * Check if a user can manage (update or delete) a course.
 * Returns true if user.accountType is Admin,
 * or if user.accountType is Instructor and course.instructor equals user's id.
 *
 * @param {object} user - User document or object with accountType and id/_id
 * @param {object} course - Course document or object with instructor
 * @returns {boolean}
 */
const canManageCourse = (user, course) => {
  if (!user || !course) {
    return false;
  }

  const role = user.accountType || user.role;

  if (role === ROLES.ADMIN || role === 'Admin') {
    return true;
  }

  if (role === ROLES.INSTRUCTOR || role === 'Instructor') {
    const userId = (user._id || user.id)?.toString();
    const instructorId = (course.instructor?._id || course.instructor?.id || course.instructor)?.toString();

    return Boolean(userId && instructorId && userId === instructorId);
  }

  return false;
};

module.exports = { canManageCourse };
