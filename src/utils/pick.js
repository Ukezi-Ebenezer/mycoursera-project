'use strict';

/**
 * Creates an object composed of the picked object properties.
 *
 * @param {object} object - Source object
 * @param {Array<string>} allowedKeys - Array of allowed property names
 * @returns {object} Object with only allowed keys that are defined in source
 */
const pick = (object, allowedKeys) => {
  if (!object || typeof object !== 'object') {
    return {};
  }

  const result = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(object, key) && object[key] !== undefined) {
      result[key] = object[key];
    }
  }
  return result;
};

module.exports = { pick };
