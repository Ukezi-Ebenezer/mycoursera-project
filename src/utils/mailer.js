'use strict';

/**
 * Send OTP to user's email
 * Development implementation logs to console
 * @param {object} param0
 * @param {string} param0.email - Recipient email
 * @param {string} param0.otp - 6-digit OTP code
 */
const sendOtpEmail = async ({ email }) => {
  // Safe logging: never print OTP code to console
  return true;
};

module.exports = { sendOtpEmail };
