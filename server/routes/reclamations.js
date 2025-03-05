const express = require('express');
const router = express.Router();
const reclamationController = require('../controllers/reclamationController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create a new reclamation - requires authentication
router.post('/', auth, reclamationController.createReclamation);

// Get all reclamations for the logged-in user - requires authentication
router.get('/user', auth, reclamationController.getUserReclamations);

// Get all reclamations - requires admin privileges
router.get('/', [auth, admin], reclamationController.getAllReclamations);

// Update reclamation status - requires admin privileges
router.put('/:id/status', [auth, admin], reclamationController.updateReclamationStatus);

module.exports = router;