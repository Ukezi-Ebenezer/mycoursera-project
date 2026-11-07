'use strict';

const mongoose = require('mongoose');
const { getCurrentProfile, updateUserProfile } = require('../services/user.service');
const { updateUserSchema } = require('../validators/user.validator');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/users/current
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const profile = await getCurrentProfile(req.user._id);

    return sendSuccess(res, 200, 'Retrieved a current logged in profile successfully', profile);
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

/**
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id) || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return sendError(res, 400, 'Invalid user id');
  }

  // Must match authenticated user's ID before touching DB
  if (req.user._id.toString() !== id) {
    return sendError(res, 403, 'You can only update your own profile');
  }

  // Validate body using Joi
  const { error, value } = updateUserSchema.validate(req.body || {}, { abortEarly: true });
  if (error) {
    return sendError(res, 400, error.details[0].message);
  }

  // Check if at least one valid field to update remains after stripping unknown
  if (!value || Object.keys(value).length === 0) {
    return sendError(res, 400, 'No valid fields to update');
  }

  try {
    const updatedProfile = await updateUserProfile(id, value, req.user.name);
    return sendSuccess(res, 200, 'User edited successfully', updatedProfile);
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message);
    }
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

module.exports = { getCurrentUser, updateUser };
