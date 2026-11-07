'use strict';

/**
 * Format a Date object or date string to YYYY-MM-DD format
 * @param {Date|string} date
 * @returns {string|null}
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

/**
 * Split a full name into first_name and last_name
 * @param {string} name
 * @returns {{ first_name: string, last_name: string }}
 */
const splitName = (name = '') => {
  const trimmed = (name || '').trim();
  const firstSpaceIndex = trimmed.indexOf(' ');
  if (firstSpaceIndex === -1) {
    return {
      first_name: trimmed,
      last_name: '',
    };
  }
  return {
    first_name: trimmed.substring(0, firstSpaceIndex),
    last_name: trimmed.substring(firstSpaceIndex + 1).trim(),
  };
};

/**
 * Formats a user model/document into a public profile response object.
 * Does not expose password, password hash, or __v.
 *
 * @param {object} user - Mongoose User document or plain object
 * @returns {object} Formatted profile
 */
const toProfileResponse = (user) => {
  return {
    id: user._id ? user._id.toString() : (user.id ? user.id.toString() : undefined),
    name: user.name,
    email: user.email,
    accountType: user.accountType,
    phoneNumber: user.phoneNumber || null,
    occupation: user.occupation || null,
    dateOfBirth: formatDate(user.dateOfBirth),
    address: {
      street: user.address || null,
      state: user.state || null,
      country: user.country || null,
      countryCode: user.countryCode || null,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Formats a user model/document into a flat update response object.
 * Never includes password, hash, accountType, _id, __v, or token.
 *
 * @param {object} user - Mongoose User document or plain object
 * @returns {object} Formatted flat update profile
 */
const toUpdateResponse = (user) => {
  const { first_name, last_name } = splitName(user.name);

  return {
    id: user._id ? user._id.toString() : (user.id ? user.id.toString() : undefined),
    first_name,
    last_name,
    email: user.email,
    phone_number: user.phoneNumber || null,
    country: user.country || null,
    state: user.state || null,
    countryCode: user.countryCode || null,
    occupation: user.occupation || null,
    address: user.address || null,
    dateOfBirth: formatDate(user.dateOfBirth),
  };
};

module.exports = { toProfileResponse, toUpdateResponse, splitName };
