const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
    }

    // Add user to request object for further use
    req.adminUser = user;

    // Check if trying to access user-specific data
    if (req.params.userId && req.params.userId !== user._id.toString()) {
      // Verify if the admin has permission to access other user's data
      if (!user.isAdmin) {
        return res.status(403).json({ 
          message: 'Accès refusé - Vous n\'avez pas les droits pour accéder aux données d\'autres utilisateurs'
        });
      }
    }
    
    next();
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
