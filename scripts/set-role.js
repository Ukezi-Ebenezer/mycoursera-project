'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { ALL_ROLES } = require('../src/constants/roles');
const logger = require('../src/utils/logger');

async function setRole() {
  const [emailArg, roleArg] = process.argv.slice(2);

  if (!emailArg || !roleArg) {
    console.error('❌ Usage: npm run users:set-role -- <email> <role>');
    console.error(`   Available roles: ${ALL_ROLES.join(', ')}`);
    process.exit(1);
  }

  // Validate the role against ALL_ROLES (case-insensitive match to canonical role)
  const canonicalRole = ALL_ROLES.find(
    (role) => role.toLowerCase() === roleArg.trim().toLowerCase()
  );

  if (!canonicalRole) {
    console.error(`❌ Error: Invalid role "${roleArg}". Must be one of: ${ALL_ROLES.join(', ')}`);
    process.exit(1);
  }

  const email = emailArg.toLowerCase().trim();
  const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nevtech-elearning';

  try {
    await mongoose.connect(dbUri);

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found.`);
      process.exitCode = 1;
      return;
    }

    const oldRole = user.accountType;
    console.log(`ℹ️ Updating user "${user.email}":`);
    console.log(`   Old role: ${oldRole}`);
    console.log(`   New role: ${canonicalRole}`);

    if (oldRole === canonicalRole) {
      console.log(`ℹ️ User already has role "${canonicalRole}". No update needed.`);
      return;
    }

    user.accountType = canonicalRole;
    await user.save();

    logger.logRoleChange({
      userId: user._id,
      newRole: canonicalRole,
      changedFields: ['accountType'],
    });

    console.log(`✅ Successfully updated role for "${user.email}" to "${canonicalRole}".`);
  } catch (error) {
    console.error(`❌ Failed to update role: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setRole();
