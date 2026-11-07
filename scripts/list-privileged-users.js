'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { ROLES } = require('../src/constants/roles');

async function listPrivilegedUsers() {
  const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nevtech-elearning';

  try {
    await mongoose.connect(dbUri);

    const privilegedUsers = await User.find(
      { accountType: { $in: [ROLES.INSTRUCTOR, ROLES.ADMIN] } },
      'name email accountType createdAt'
    ).sort({ createdAt: -1 });

    if (!privilegedUsers || privilegedUsers.length === 0) {
      console.log('ℹ️ No privileged users (Instructor or Admin) found in the database.');
      return;
    }

    console.log(`\n📋 Found ${privilegedUsers.length} privileged user(s):\n`);
    console.table(
      privilegedUsers.map((u) => ({
        ID: u._id.toString(),
        Name: u.name,
        Email: u.email,
        Role: u.accountType,
        CreatedAt: u.createdAt ? u.createdAt.toISOString() : 'N/A',
      }))
    );
  } catch (error) {
    console.error(`❌ Failed to list privileged users: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

listPrivilegedUsers();
