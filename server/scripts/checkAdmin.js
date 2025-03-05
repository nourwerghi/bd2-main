const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@mayamarket.com' });
    if (admin) {
      console.log('Admin user found:', {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        isAdmin: admin.isAdmin,
        password: admin.password // Pour vérifier le hash
      });
    } else {
      console.log('Admin user not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkAdmin();
