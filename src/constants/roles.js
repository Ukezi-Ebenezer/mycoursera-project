'use strict';

const ROLES = Object.freeze({
  USER: 'User',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
});

const ALL_ROLES = Object.freeze(Object.values(ROLES));

module.exports = {
  ROLES,
  ALL_ROLES,
};
