'use strict';

const Course = require('../models/Course');
const { toCourseResponse } = require('../utils/course');

/**
 * Escape regular expression special characters
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Retrieve a paginated list of courses with filtering, searching, and sorting
 *
 * @param {object} query - Cleaned query parameters from req.validatedQuery
 * @param {object} user - Authenticated user from req.user
 * @returns {Promise<{ courses: Array<object>, pagination: object }>}
 */
const getCourses = async (query, user) => {
  const {
    page = 0,
    size = 10,
    q,
    category,
    level,
    availability,
    sort = 'createdAt',
    order = 'desc',
  } = query;

  const filter = {};

  // Visibility:
  // - "User" accounts can ONLY view available courses (availability filter ignored)
  // - "Instructor" / "Admin" can view all, and respect availability filter if provided
  const userRole = user?.accountType || user?.role;
  if (userRole === 'User') {
    filter.availability = true;
  } else if (availability !== undefined) {
    filter.availability = availability;
  }

  // Case-insensitive search on title and tags with escaped regex
  if (q && q.trim()) {
    const safeQ = escapeRegex(q.trim());
    const searchRegex = new RegExp(safeQ, 'i');
    filter.$or = [
      { title: searchRegex },
      { tags: searchRegex },
    ];
  }

  // Exact category filter
  if (category && category.trim()) {
    filter.category = category.trim();
  }

  // Exact level filter
  if (level && level.trim()) {
    filter.level = level.trim();
  }

  // Sorting with whitelist and _id as stable secondary sort
  const allowedSortFields = ['createdAt', 'price', 'title'];
  const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
  const sortDirection = order === 'asc' ? 1 : -1;

  const sortOptions = {
    [sortField]: sortDirection,
    _id: sortDirection,
  };

  const skip = page * size;
  const limit = size;

  // Execute count and query in parallel
  const [totalItems, rawCourses] = await Promise.all([
    Course.countDocuments(filter),
    Course.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.ceil(totalItems / size);

  const courses = rawCourses.map(toCourseResponse);

  return {
    courses,
    pagination: {
      page,
      size,
      totalItems,
      totalPages,
    },
  };
};

module.exports = {
  getCourses,
};
