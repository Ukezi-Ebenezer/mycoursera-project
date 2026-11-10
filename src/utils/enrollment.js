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

module.exports = {
  formatAmount,
  toEnrollmentResponse,
};
