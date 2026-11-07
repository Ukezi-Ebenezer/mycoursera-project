'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const BlacklistedToken = require('../models/BlacklistedToken');
const { generateToken, hashToken } = require('../utils/token');
const { sendOtpEmail } = require('../utils/mailer');

/**
 * Register a new user
 * @param {object} data - Validated registration payload
 * @returns {{ token: string, user: object }}
 */
const registerUser = async (data) => {
  const { name, email, password, accountType, country, countryCode, state, address, phoneNumber, instructorCode } = data;

  // Privileged role signup protection: verify code BEFORE database queries
  if (accountType === 'Instructor' || accountType === 'Admin') {
    const requiredCode = accountType === 'Instructor'
      ? process.env.INSTRUCTOR_SIGNUP_CODE
      : process.env.ADMIN_SIGNUP_CODE;

    // Fail closed if matching environment variable is missing or empty
    if (!requiredCode || typeof requiredCode !== 'string' || !requiredCode.trim()) {
      const error = new Error('Signup for this role is disabled');
      error.statusCode = 403;
      throw error;
    }

    // Require non-empty signup code
    if (!instructorCode || typeof instructorCode !== 'string' || !instructorCode.trim()) {
      const error = new Error('Invalid or missing signup code');
      error.statusCode = 403;
      throw error;
    }

    // Compare safely using SHA-256 digests with crypto.timingSafeEqual
    const hashInput = crypto.createHash('sha256').update(instructorCode.trim()).digest();
    const hashRequired = crypto.createHash('sha256').update(requiredCode.trim()).digest();

    if (!crypto.timingSafeEqual(hashInput, hashRequired)) {
      const error = new Error('Invalid or missing signup code');
      error.statusCode = 403;
      throw error;
    }
  }

  // Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  // Create user (password hashed by pre-save hook in model)
  const user = await User.create({
    name,
    email,
    password,
    accountType,
    country,
    countryCode,
    state,
    address,
    phoneNumber,
  });

  // Generate JWT
  const token = generateToken(user);

  // Build safe user object — never expose password
  const userPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    accountType: user.accountType,
    country: user.country,
    countryCode: user.countryCode,
    state: user.state,
    address: user.address,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { token, user: userPayload };
};

/**
 * Authenticate a user
 * @param {object} data - Validated login payload ({ email, password })
 * @returns {{ token: string, user: object }}
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select password
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  const userPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    accountType: user.accountType,
    country: user.country,
    countryCode: user.countryCode,
    state: user.state,
    address: user.address,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { token, user: userPayload };
};

/**
 * Send forgot password OTP
 * @param {object} data - { email }
 */
const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user exists (only generate and send OTP if user exists)
  const user = await User.findOne({ email: normalizedEmail });
  if (user) {
    const otp = crypto.randomInt(100000, 1000000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Replace any existing OTP for this email
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
      verified: false,
      attempts: 0,
    });

    await sendOtpEmail({ email: normalizedEmail, otp });
  }
};

/**
 * Verify OTP
 * @param {object} data - { email, otp }
 */
const verifyOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await Otp.findOne({ email: normalizedEmail });
  if (!otpRecord) {
    const error = new Error('Invalid or expired OTP');
    error.statusCode = 400;
    throw error;
  }

  // Check expiration
  if (new Date() > otpRecord.expiresAt) {
    await Otp.deleteOne({ _id: otpRecord._id });
    const error = new Error('Invalid or expired OTP');
    error.statusCode = 400;
    throw error;
  }

  // Check attempt limit
  if (otpRecord.attempts >= 5) {
    const error = new Error('Maximum verification attempts exceeded. Please request a new OTP.');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    if (otpRecord.attempts >= 5) {
      const error = new Error('Maximum verification attempts exceeded. Please request a new OTP.');
      error.statusCode = 400;
      throw error;
    }

    const error = new Error('Invalid or expired OTP');
    error.statusCode = 400;
    throw error;
  }

  otpRecord.verified = true;
  await otpRecord.save();
};

/**
 * Reset user password
 * @param {object} data - Validated reset password payload ({ email, password })
 */
const resetPassword = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const requireOtp = process.env.REQUIRE_OTP_VERIFICATION === 'true';

  let otpRecord = null;
  if (requireOtp) {
    otpRecord = await Otp.findOne({
      email: normalizedEmail,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      const error = new Error('Email not verified');
      error.statusCode = 403;
      throw error;
    }
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Assign new password and save so the pre-save hook hashes it
  user.password = password;
  await user.save();

  // If OTP was required, delete the record so it can't be reused
  if (requireOtp && otpRecord) {
    await Otp.deleteMany({ email: normalizedEmail });
  }
};

/**
 * Logout user by saving token to BlacklistedToken
 * @param {object} param0
 * @param {string} param0.token - Raw JWT token
 * @param {number} param0.tokenExp - Token expiration timestamp (in seconds)
 */
const logout = async ({ token, tokenExp }) => {
  const tokenHash = hashToken(token);
  const expiresAt = tokenExp ? new Date(tokenExp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await BlacklistedToken.findOneAndUpdate(
    { tokenHash },
    { tokenHash, expiresAt },
    { upsert: true, new: true }
  );
};

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  forgotPassword,
  verifyOtp,
  logout,
};
