'use strict';

const mongoose = require('mongoose');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { chargeForCourse } = require('./payment.service');
const { auditLog } = require('../utils/audit');
const logger = require('../utils/logger');

/**
 * Enroll a user into a course.
 *
 * @param {object} params
 * @param {string} params.courseId - ID of course to enroll in
 * @param {number} params.amount - Client-supplied amount
 * @param {object} params.user - Authenticated user from req.user
 * @returns {Promise<object>} Created enrollment document
 */
const enrollInCourse = async ({ courseId, amount, user }) => {
  // Validate courseId as a valid ObjectId string
  if (
    typeof courseId !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(courseId) ||
    !mongoose.isValidObjectId(courseId)
  ) {
    const error = new Error('Invalid course id');
    error.statusCode = 400;
    throw error;
  }

  // Load the course with findById and .lean()
  const course = await Course.findById(courseId).lean();

  // If it doesn't exist, or its availability is false, return 404 "Course not found"
  if (!course || course.availability === false) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Never trust the amount from the client. Compare it with course.price in cents
  const clientCents = Math.round(Number(amount) * 100);
  const courseCents = Math.round(Number(course.price) * 100);

  if (clientCents !== courseCents) {
    const error = new Error('Amount does not match the course price');
    error.statusCode = 400;
    throw error;
  }

  const userId = (user._id || user.id)?.toString();
  const instructorId = (course.instructor?._id || course.instructor?.id || course.instructor)?.toString();

  // If req.user is the instructor of that course, return 403 "You cannot enroll in your own course"
  if (instructorId && userId && instructorId === userId) {
    const error = new Error('You cannot enroll in your own course');
    error.statusCode = 403;
    throw error;
  }

  // If an Enrollment for this user and course already exists, return 409
  const existingEnrollment = await Enrollment.findOne({
    user: userId,
    course: course._id,
  });

  if (existingEnrollment) {
    const error = new Error('You are already enrolled in this course');
    error.statusCode = 409;
    throw error;
  }

  // Call chargeForCourse from payment.service.js with the user id, course id and database price
  let chargeResult;
  try {
    chargeResult = await chargeForCourse({
      userId,
      courseId: course._id,
      amount: course.price,
      currency: course.currency || 'USD',
    });
  } catch (chargeErr) {
    // If it throws a 503 error, return 503 "Payment gateway not configured"
    if (chargeErr.statusCode === 503) {
      throw chargeErr;
    }
    const error = new Error('Payment failed');
    error.statusCode = 402;
    throw error;
  }

  if (!chargeResult || !chargeResult.success) {
    const error = new Error('Payment failed');
    error.statusCode = 402;
    throw error;
  }

  // Payment status: "free" when price is 0, otherwise "paid"
  const paymentStatus = Number(course.price) === 0 ? 'free' : 'paid';

  // Create the Enrollment only AFTER a successful charge
  let enrollment;
  try {
    enrollment = await Enrollment.create({
      user: userId,
      course: course._id,
      amountPaid: course.price,
      currency: course.currency || 'USD',
      paymentStatus,
      paymentReference: chargeResult.reference || undefined,
      status: 'active',
      progress: 0,
      enrolledAt: new Date(),
    });
  } catch (dbErr) {
    // Rely on unique index for safety: catch duplicate key error 11000
    if (dbErr.code === 11000) {
      const error = new Error('You are already enrolled in this course');
      error.statusCode = 409;
      throw error;
    }

    // If saving fails after a successful charge, log with payment reference
    // TODO: Real gateway integration will need a refund or reconciliation step here
    logger.error('Failed to save enrollment document after successful payment charge', {
      event: 'enrollment_creation_failed',
      userId,
      courseId: course._id.toString(),
      paymentReference: chargeResult.reference,
      error: dbErr.message,
    });

    const error = new Error('An internal server error occurred');
    error.statusCode = 500;
    throw error;
  }

  // Log each successful enrollment with auditLog (never log payment reference or token)
  auditLog('course_enrolled', {
    userId,
    targetId: course._id.toString(),
    role: user.accountType || user.role,
    extra: {
      amount: course.price,
      paymentStatus,
    },
  });

  return enrollment;
};

module.exports = {
  enrollInCourse,
};
