'use strict';

/**
 * Safe application logger.
 * Never prints Authorization headers, passwords, tokens, OTPs, or instructor codes.
 */
const logger = {
  info: (message, meta) => {
    if (typeof message === 'object' && !meta) {
      console.log('[INFO]', JSON.stringify(message));
      return;
    }
    if (meta) {
      console.log(`[INFO] ${message}`, JSON.stringify(meta));
    } else {
      console.log(`[INFO] ${message}`);
    }
  },

  warn: (message, meta) => {
    if (meta) {
      console.warn(`[WARN] ${message}`, JSON.stringify(meta));
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },

  error: (message, meta) => {
    if (meta) {
      console.error(`[ERROR] ${message}`, typeof meta === 'object' ? JSON.stringify(meta) : meta);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },

  /**
   * Log course updates safely
   * @param {object} param0
   * @param {string|object} param0.userId
   * @param {string|object} param0.courseId
   * @param {Array<string>|object} param0.changedFields
   */
  logCourseUpdate: ({ userId, courseId, changedFields }) => {
    const payload = {
      userId: userId ? userId.toString() : null,
      courseId: courseId ? courseId.toString() : null,
      changedFields: Array.isArray(changedFields)
        ? changedFields
        : Object.keys(changedFields || {}),
    };
    console.log('[AUDIT] Course Updated:', JSON.stringify(payload));
  },

  /**
   * Log course deletion safely
   * @param {object} param0
   * @param {string} [param0.event='course_deleted']
   * @param {string|object} param0.userId
   * @param {string|object} param0.courseId
   * @param {string} param0.role
   */
  logCourseDelete: ({ event = 'course_deleted', userId, courseId, role }) => {
    const payload = {
      event,
      userId: userId ? userId.toString() : null,
      courseId: courseId ? courseId.toString() : null,
      role: role || null,
    };
    console.log('[AUDIT] Course Deleted:', JSON.stringify(payload));
  },

  /**
   * Log role changes safely
   * @param {object} param0
   * @param {string|object} param0.userId
   * @param {string} param0.courseId
   * @param {Array<string>} param0.changedFields
   */
  logRoleChange: ({ userId, courseId = null, changedFields = ['accountType'] }) => {
    const payload = {
      userId: userId ? userId.toString() : null,
      courseId: courseId ? courseId.toString() : null,
      changedFields: Array.isArray(changedFields) ? changedFields : [changedFields],
    };
    console.log('[AUDIT] Role Changed:', JSON.stringify(payload));
  },
};

module.exports = logger;
