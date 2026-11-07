'use strict';

const { auditLog } = require('./audit');

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
   * Log course updates safely (delegates to auditLog)
   */
  logCourseUpdate: ({ userId, courseId, changedFields }) => {
    return auditLog('course_updated', {
      userId,
      targetId: courseId,
      extra: { changedFields },
    });
  },

  /**
   * Log course deletion safely (delegates to auditLog)
   */
  logCourseDelete: ({ event = 'course_deleted', userId, courseId, role }) => {
    return auditLog(event, {
      userId,
      targetId: courseId,
      role,
    });
  },

  /**
   * Log role changes safely (delegates to auditLog)
   */
  logRoleChange: ({ userId, courseId = null, changedFields = ['accountType'] }) => {
    return auditLog('role_changed', {
      userId,
      targetId: courseId,
      extra: { changedFields },
    });
  },
};

module.exports = logger;
