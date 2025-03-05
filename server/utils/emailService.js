const { sendUserNotification } = require('./websocketService');

exports.sendOrderNotification = async (order) => {
  try {
    // Get admin users to notify
    const User = require('../models/User');
    const admins = await User.find({ isAdmin: true });

    // Send notification to each admin
    for (const admin of admins) {
      await sendUserNotification(admin._id, {
        title: 'New Order Received',
        message: `New order #${order._id} from ${order.user.username} for €${order.total}`,
        type: 'order',
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Failed to send order notification:', error);
  }
};