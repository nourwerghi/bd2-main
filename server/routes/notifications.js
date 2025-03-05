const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  sendNotification,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Protected routes - require authentication
router.use(protect);

// Get user's notifications
router.get('/', getNotifications);

// Send a notification
router.post('/', sendNotification);

// Mark a notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

module.exports = router;