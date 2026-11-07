'use strict';

/**
 * Send OTP to user's email
 * Development implementation logs to console
 * @param {object} param0
 * @param {string} param0.email - Recipient email
 * @param {string} param0.otp - 6-digit OTP code
 */
const sendOtpEmail = async ({ email, otp }) => {
  // In development, log OTP to console
  console.log(`\n================== [MAILER] ==================`);
  console.log(`[Mailer] OTP Code for ${email}: ${otp}`);
  console.log(`[Mailer] Valid for 10 minutes.`);
  console.log(`==============================================\n`);
  return true;
};

module.exports = { sendOtpEmail };
