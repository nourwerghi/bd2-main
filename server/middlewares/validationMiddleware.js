const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Username validation
  if (!username || username.length < 3) {
    errors.push({
      fr: 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
      en: 'Username must be at least 3 characters long'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({
      fr: 'Email invalide',
      en: 'Invalid email format'
    });
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push({
      fr: 'Le mot de passe doit contenir au moins 6 caractères',
      en: 'Password must be at least 6 characters long'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors,
      message: errors[0].en // Default to English message
    });
  }

  next();
};

module.exports = { validateRegistration };