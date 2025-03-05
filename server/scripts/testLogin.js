const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@mayamarket.com';
    const password = 'Admin123!';

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }

    // Tester le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (isMatch) {
      console.log('Login successful!');
    } else {
      console.log('Password incorrect');
      
      // Créer un nouveau hash pour vérification
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      console.log('New password hash:', newHash);
      console.log('Stored password hash:', user.password);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testLogin();
