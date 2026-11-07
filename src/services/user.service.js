'use strict';

const User = require('../models/User');
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
  const updateFields = {};

  // Check email uniqueness if email is being updated
  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 409;
      throw error;
    }
    updateFields.email = updateData.email;
  }

  // Name handling: first_name / last_name
  if (updateData.first_name !== undefined || updateData.last_name !== undefined) {
    const { first_name: currentFirst, last_name: currentLast } = splitName(currentUserName || '');
    const newFirst = updateData.first_name !== undefined ? updateData.first_name : currentFirst;
    const newLast = updateData.last_name !== undefined ? updateData.last_name : currentLast;
    updateFields.name = [newFirst, newLast].filter(Boolean).join(' ').trim();
  }

  // Map phone_number -> phoneNumber
  if (updateData.phone_number !== undefined) {
    updateFields.phoneNumber = updateData.phone_number;
  }

  if (updateData.country !== undefined) {
    updateFields.country = updateData.country;
  }

  if (updateData.state !== undefined) {
    updateFields.state = updateData.state;
  }

  if (updateData.countryCode !== undefined) {
    updateFields.countryCode = updateData.countryCode;
  }

  if (updateData.occupation !== undefined) {
    updateFields.occupation = updateData.occupation;
  }

  if (updateData.address !== undefined) {
    updateFields.address = updateData.address;
  }

  if (updateData.dateOfBirth !== undefined) {
    if (updateData.dateOfBirth === null || updateData.dateOfBirth === '') {
      updateFields.dateOfBirth = null;
    } else {
      updateFields.dateOfBirth = new Date(updateData.dateOfBirth);
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
