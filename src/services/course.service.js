'use strict';

const mongoose = require('mongoose');
const Course = require('../models/Course');
const { toCourseResponse } = require('../utils/course');
const { canManageCourse } = require('../utils/ownership');
const { ROLES } = require('../constants/roles');
const { pick } = require('../utils/pick');
const { auditLog } = require('../utils/audit');

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

/**
 * Retrieve a single course by its unique ID
 *
 * @param {string} id - 24-character hexadecimal MongoDB ObjectId
 * @param {object} user - Authenticated user from req.user
 * @returns {Promise<object>} Formatted course object
 */
const getCourseById = async (id, user) => {
  // Validate :id with mongoose.isValidObjectId (and ensure 24-character hex string)
  if (
    typeof id !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(id) ||
    !mongoose.isValidObjectId(id)
  ) {
    const error = new Error('Invalid course id');
    error.statusCode = 400;
    throw error;
  }

  // Find course with findById and .lean()
  const course = await Course.findById(id).lean();

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Visibility: if req.user.accountType is "User" and the course has availability false,
  // return the exact same 404 "Course not found" response.
  const userRole = user?.accountType || user?.role;
  if (userRole === 'User' && course.availability === false) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  return toCourseResponse(course);
};

/**
 * Update an existing course by its unique ID
 *
 * @param {string} id - 24-character hexadecimal MongoDB ObjectId
 * @param {object} updateData - Cleaned update fields from validated body
 * @param {object} user - Authenticated user from req.user
 * @returns {Promise<object>} Formatted updated course object
 */
const updateCourse = async (id, updateData, user) => {
  // Validate :id as a valid ObjectId
  if (
    typeof id !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(id) ||
    !mongoose.isValidObjectId(id)
  ) {
    const error = new Error('Invalid course id');
    error.statusCode = 400;
    throw error;
  }

  // Fetch the course with findById
  const existingCourse = await Course.findById(id);
  if (!existingCourse) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership check
  if (!canManageCourse(user, existingCourse)) {
    const error = new Error('You can only edit your own courses');
    error.statusCode = 403;
    throw error;
  }

  // Pick only strictly allowed fields for course update
  const allowedCourseKeys = [
    'title',
    'description',
    'price',
    'tags',
    'level',
    'category',
    'duration',
    'availability',
  ];
  const safeUpdateData = pick(updateData, allowedCourseKeys);

  // Build filter: include _id, and instructor: req.user._id for Instructor
  const filter = { _id: id };
  const userRole = user?.accountType || user?.role;
  const isInstructor = userRole === ROLES.INSTRUCTOR || userRole === 'Instructor';
  if (isInstructor) {
    filter.instructor = user._id || user.id;
  }

  // Update with findOneAndUpdate
  const updatedCourse = await Course.findOneAndUpdate(
    filter,
    { $set: safeUpdateData },
    { new: true, runValidators: true }
  );

  if (!updatedCourse) {
    const error = new Error('You can only edit your own courses');
    error.statusCode = 403;
    throw error;
  }

  // Audit log the update safely
  auditLog('course_updated', {
    userId: user?._id || user?.id,
    targetId: updatedCourse._id,
    role: userRole,
    extra: { changedFields: Object.keys(safeUpdateData) },
  });

  return toCourseResponse(updatedCourse);
};

/**
 * Delete an existing course by its unique ID (Hard delete)
 *
 * @param {string} id - 24-character hexadecimal MongoDB ObjectId
 * @param {object} user - Authenticated user from req.user
 * @returns {Promise<void>}
 */
const deleteCourse = async (id, user) => {
  // Validate :id as a valid ObjectId
  if (
    typeof id !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(id) ||
    !mongoose.isValidObjectId(id)
  ) {
    const error = new Error('Invalid course id');
    error.statusCode = 400;
    throw error;
  }

  // Fetch the course with findById
  const existingCourse = await Course.findById(id);
  if (!existingCourse) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership: use canManageCourse(req.user, course) from src/utils/ownership.js
  if (!canManageCourse(user, existingCourse)) {
    const error = new Error('You can only delete your own courses');
    error.statusCode = 403;
    throw error;
  }

  // TODO: when enrollments exist, handle enrolled students here (block deletion or cascade)

  // Build filter: include _id, and instructor: req.user._id when requester is an Instructor (no instructor filter for Admin)
  const filter = { _id: id };
  const userRole = user?.accountType || user?.role;
  const isInstructor = userRole === ROLES.INSTRUCTOR || userRole === 'Instructor';
  if (isInstructor) {
    filter.instructor = user._id || user.id;
  }

  // Delete with findOneAndDelete
  const deletedCourse = await Course.findOneAndDelete(filter);
  if (!deletedCourse) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Audit log the deletion safely
  auditLog('course_deleted', {
    userId: (user?._id || user?.id)?.toString(),
    targetId: id.toString(),
    role: userRole,
  });
};

module.exports = {
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
