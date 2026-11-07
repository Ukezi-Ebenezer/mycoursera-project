'use strict';

const User = require('../models/User');
const { pick } = require('../utils/pick');
const { toProfileResponse, toUpdateResponse, splitName } = require('../utils/profile');

/**
 * Get current logged in user profile
 * @param {string} userId - User ID
 * @returns {object} Formatted profile response
 */
const getCurrentProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return toProfileResponse(user);
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updateData - Validated update fields
 * @param {string} currentUserName - Current name of the user from req.user
 * @returns {object} Formatted flat update response
 */
const updateUserProfile = async (userId, updateData, currentUserName) => {
  const allowedKeys = [
    'first_name',
    'last_name',
    'email',
    'phone_number',
    'country',
    'state',
    'countryCode',
    'occupation',
    'address',
    'dateOfBirth',
  ];
  const safeData = pick(updateData, allowedKeys);
  const updateFields = {};

  // Check email uniqueness if email is being updated
  if (safeData.email) {
    const existingUser = await User.findOne({
      email: safeData.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 409;
      throw error;
    }
    updateFields.email = safeData.email;
  }

  // Name handling: first_name / last_name
  if (safeData.first_name !== undefined || safeData.last_name !== undefined) {
    const { first_name: currentFirst, last_name: currentLast } = splitName(currentUserName || '');
    const newFirst = safeData.first_name !== undefined ? safeData.first_name : currentFirst;
    const newLast = safeData.last_name !== undefined ? safeData.last_name : currentLast;
    updateFields.name = [newFirst, newLast].filter(Boolean).join(' ').trim();
  }

  // Map phone_number -> phoneNumber
  if (safeData.phone_number !== undefined) {
    updateFields.phoneNumber = safeData.phone_number;
  }

  if (safeData.country !== undefined) {
    updateFields.country = safeData.country;
  }

  if (safeData.state !== undefined) {
    updateFields.state = safeData.state;
  }

  if (safeData.countryCode !== undefined) {
    updateFields.countryCode = safeData.countryCode;
  }

  if (safeData.occupation !== undefined) {
    updateFields.occupation = safeData.occupation;
  }

  if (safeData.address !== undefined) {
    updateFields.address = safeData.address;
  }

  if (safeData.dateOfBirth !== undefined) {
    if (safeData.dateOfBirth === null || safeData.dateOfBirth === '') {
      updateFields.dateOfBirth = null;
    } else {
      updateFields.dateOfBirth = new Date(safeData.dateOfBirth);
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return toUpdateResponse(updatedUser);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('Email already in use');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

module.exports = { getCurrentProfile, updateUserProfile };
