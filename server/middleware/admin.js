const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
