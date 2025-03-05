const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createTopAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing top admin if exists
    await User.deleteOne({ email: 'topadmin@gmail.com' });
    console.log('Removed existing top admin if any');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create the top admin user
    const topAdmin = new User({
      username: 'Top Admin',
      email: 'topadmin@gmail.com',
      password: hashedPassword,
      isAdmin: true
    });

    // Disable password hashing middleware
    topAdmin.$ignore('save');

    // Save to database
    await topAdmin.save();
    
    console.log('Top admin user created successfully');
    console.log('Email: topadmin@gmail.com');
    console.log('Password: 123456');

    // Verify password
    const isMatch = await bcrypt.compare('123456', topAdmin.password);
    console.log('Password verification:', isMatch);

  } catch (error) {
    console.error('Error creating top admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTopAdmin();