'use strict';

/**
 * Format a numeric amount into a currency string.
 * Returns "$" plus the number, without decimals if it's a whole number (e.g. 30 -> "$30"),
 * and with two decimal places otherwise (e.g. 29.5 -> "$29.50").
 *
 * @param {number|string} n - Amount to format
 * @returns {string} Formatted amount
 */
const formatAmount = (n) => {
  const num = Number(n);
  if (isNaN(num)) {
    return '$0';
  }
  if (Number.isInteger(num)) {
    return `$${num}`;
  }
  return `$${num.toFixed(2)}`;
};

/**
 * Transform an enrollment Mongoose document or plain object into a sanitized public response.
 * Never includes _id, __v, paymentReference, or other users' data.
 *
 * @param {object} enrollment - Raw enrollment document or lean object
 * @returns {object} Formatted enrollment response
 */
const toEnrollmentResponse = (enrollment) => {
  if (!enrollment) {
    return null;
  }

  const rawId = enrollment._id || enrollment.id;
  const rawCourse = enrollment.course?._id || enrollment.course?.id || enrollment.course;
  const rawUser = enrollment.user?._id || enrollment.user?.id || enrollment.user;

  return {
    id: rawId ? rawId.toString() : null,
    amount: formatAmount(enrollment.amountPaid),
    courseId: rawCourse ? rawCourse.toString() : null,
    user: rawUser ? rawUser.toString() : null,
    status: enrollment.status,
    progress: enrollment.progress,
    paymentStatus: enrollment.paymentStatus,
    transactionDate: enrollment.enrolledAt,
  };
};

/**
 * Transform an enrollment document and course document into a sanitized completion response.
 * Never includes _id, __v, paymentReference, or another user's data.
 *
 * @param {object} enrollment - Raw enrollment document or plain object
 * @param {object} course - Lean course object with title and description
 * @returns {object} Formatted completion response
 */
const toCompletionResponse = (enrollment, course) => {
  if (!enrollment) {
    return null;
  }

  const rawId = enrollment._id || enrollment.id;
  const rawCourseId = enrollment.course?._id || enrollment.course?.id || enrollment.course;

  return {
    id: rawId ? rawId.toString() : null,
    courseId: rawCourseId ? rawCourseId.toString() : null,
    title: course?.title || '',
    description: course?.description || '',
    isCompleted: enrollment.status === 'completed',
    progress: enrollment.progress !== undefined ? enrollment.progress : 0,
    status: enrollment.status,
    completedAt: enrollment.completedAt || null,
  };
};

module.exports = {
  formatAmount,
  toEnrollmentResponse,
  toCompletionResponse,
};
