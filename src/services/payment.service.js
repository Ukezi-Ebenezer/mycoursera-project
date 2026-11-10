'use strict';

const crypto = require('crypto');

/**
 * Charge for course enrollment.
 * NOTE: Real Paystack or Stripe integration will replace this mock implementation later.
 * The function signature chargeForCourse({ userId, courseId, amount, currency }) must remain unchanged.
 *
 * @param {object} params
 * @param {string|object} params.userId - ID of the paying user
 * @param {string|object} params.courseId - ID of the course being purchased
 * @param {number} params.amount - Price of the course
 * @param {string} [params.currency='USD'] - Payment currency
 * @returns {Promise<{ success: boolean, reference: string|null }>}
 */
const chargeForCourse = async ({ userId, courseId, amount, currency = 'USD' }) => {
  // If amount is 0, free course enrollment succeeds without calling any gateway
  if (Number(amount) === 0) {
    return { success: true, reference: null };
  }

  // Read PAYMENT_MODE from env: "mock" (default in development/non-production) or "disabled"
  const isProduction = process.env.NODE_ENV === 'production';
  const paymentMode = (
    process.env.PAYMENT_MODE ||
    (!isProduction ? 'mock' : 'disabled')
  )
    .trim()
    .toLowerCase();

  // If PAYMENT_MODE is "mock" and NODE_ENV is NOT "production", generate a mock reference
  if (paymentMode === 'mock' && !isProduction) {
    const randomHex = crypto.randomBytes(8).toString('hex'); // 16-character hex string
    return {
      success: true,
      reference: `mock_${randomHex}`,
    };
  }

  // In every other case (mock in production, disabled, unknown value), reject with 503
  const error = new Error('Payment gateway not configured');
  error.statusCode = 503;
  throw error;
};

module.exports = {
  chargeForCourse,
};
