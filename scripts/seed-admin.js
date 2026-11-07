'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { ROLES } = require('../src/constants/roles');

async function seedAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

  // Refuse to run if any of the three variables is missing or empty
  if (!ADMIN_NAME || !ADMIN_NAME.trim() || !ADMIN_EMAIL || !ADMIN_EMAIL.trim() || !ADMIN_PASSWORD) {
    console.error('❌ Error: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must all be defined in your environment (.env).');
    process.exit(1);
  }

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const dbUri = MONGO_URI || 'mongodb://127.0.0.1:27017/nevtech-elearning';

  try {
    await mongoose.connect(dbUri);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`ℹ️ User with email "${email}" already exists (role: ${existingUser.accountType}). No changes made.`);
      return;
    }

    // Create the Admin using the User model so the pre-save hook hashes the password
    const admin = await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password: ADMIN_PASSWORD,
      accountType: ROLES.ADMIN,
    });

    console.log(`✅ Admin user seeded successfully:\n  ID:    ${admin._id}\n  Name:  ${admin.name}\n  Email: ${admin.email}\n  Role:  ${admin.accountType}`);
  } catch (error) {
    console.error(`❌ Failed to seed admin user: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
