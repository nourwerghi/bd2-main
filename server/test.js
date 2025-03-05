const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Trouver l'admin
    const admin = await User.findOne({ email: 'admin@mayamarket.com' });
    console.log('\nTest 1 - Admin user:');
    console.log(admin ? 'Admin trouvé' : 'Admin non trouvé');
    if (admin) {
      console.log('Admin details:', {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        isAdmin: admin.isAdmin
      });
    }

    // Test 2: Vérifier tous les utilisateurs
    const users = await User.find();
    console.log('\nTest 2 - All users:');
    console.log(`Nombre total d'utilisateurs: ${users.length}`);
    users.forEach(user => {
      console.log({
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
