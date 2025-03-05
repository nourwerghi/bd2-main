const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Supprimer l'admin existant s'il existe
    await User.deleteOne({ email: 'admin@mayamarket.com' });
    console.log('Removed existing admin if any');

    // Hasher le mot de passe directement avec bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    // Créer l'utilisateur admin
    const admin = new User({
      username: 'admin',
      email: 'admin@mayamarket.com',
      password: hashedPassword,
      isAdmin: true
    });

    // Désactiver le middleware de hachage du mot de passe
    admin.$ignore('save');

    // Sauvegarder dans la base de données
    await admin.save();
    
    console.log('Admin user created successfully');
    console.log('Email: admin@mayamarket.com');
    console.log('Password: Admin123!');

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare('Admin123!', admin.password);
    console.log('Password verification:', isMatch);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();
