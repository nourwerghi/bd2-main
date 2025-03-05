const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAnalytics,
  getAllUsers,
  deleteUser,
  updateUserRole,
  checkStatus
} = require('../controllers/adminController');

// All routes are protected and require admin privileges
router.use(protect);
router.use(admin);

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.get('/status', checkStatus);

module.exports = router;
