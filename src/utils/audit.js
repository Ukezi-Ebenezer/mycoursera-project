'use strict';

// Forbidden key substrings (case-insensitive) that must never appear in audit logs
const FORBIDDEN_KEYS = [
  'token',
  'password',
  'code',
  'secret',
  'authorization',
  'cookie',
  'body',
  'reqbody',
];

/**
 * Recursively sanitize an object to strip sensitive fields.
 *
 * @param {any} value
 * @returns {any}
 */
const sanitizeExtra = (value) => {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeExtra);
  }
  const clean = {};
  for (const [key, val] of Object.entries(value)) {
    const isForbidden = FORBIDDEN_KEYS.some((f) =>
      key.toLowerCase().includes(f)
    );
    if (!isForbidden) {
      clean[key] = typeof val === 'object' && val !== null ? sanitizeExtra(val) : val;
    }
  }
  return clean;
};

/**
 * Structured audit logger.
 * Writes a structured log line.
 * Never logs tokens, passwords, codes, or full request bodies.
 *
 * @param {string} event - Audit event name (e.g. course_created, course_updated, course_deleted, role_changed)
 * @param {object} options
 * @param {string|object} [options.userId] - ID of actor initiating the action
 * @param {string|object} [options.targetId] - ID of target entity (course, user, etc.)
 * @param {string} [options.role] - Role of the actor
 * @param {object} [options.extra] - Additional safe metadata (e.g. changedFields)
 * @returns {object} The logged audit object
 */
const auditLog = (event, { userId, targetId, role, extra } = {}) => {
  const payload = {
    event,
    userId: userId ? userId.toString() : null,
    targetId: targetId ? targetId.toString() : null,
    role: role || null,
  };

  if (extra && typeof extra === 'object') {
    const safeExtra = sanitizeExtra(extra);
    Object.assign(payload, safeExtra);
  }

  console.log('[AUDIT]', JSON.stringify(payload));
  return payload;
};

module.exports = { auditLog };
