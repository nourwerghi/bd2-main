const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

let wss;
let notificationHistory = new Map(); // Store recent notifications for each user

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    try {
      // Extract token from query string
      const urlParams = new URLSearchParams(req.url.split('?')[1]);
      const token = urlParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication failed - No token provided');
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.id;

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log('Received:', data);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        ws.isAlive = false;
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  // Implement heartbeat to check for stale connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
};

// Send notification to specific user and store in history
const sendUserNotification = (userId, notification) => {
  if (!wss) return;

  // Store notification in history
  if (!notificationHistory.has(userId)) {
    notificationHistory.set(userId, []);
  }
  const userNotifications = notificationHistory.get(userId);
  userNotifications.unshift({ ...notification, id: Date.now(), read: false });
  // Keep only last 50 notifications
  if (userNotifications.length > 50) {
    userNotifications.pop();
  }
  notificationHistory.set(userId, userNotifications);

  // Send to connected clients
  wss.clients.forEach((client) => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
};

// Send notification to all connected clients and store in their histories
const broadcastNotification = (notification) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Store in user's history
      if (!notificationHistory.has(client.userId)) {
        notificationHistory.set(client.userId, []);
      }
      const userNotifications = notificationHistory.get(client.userId);
      userNotifications.unshift({ ...notification, id: Date.now(), read: false });
      if (userNotifications.length > 50) {
        userNotifications.pop();
      }
      notificationHistory.set(client.userId, userNotifications);

      // Send to client
      client.send(JSON.stringify(notification));
    }
  });
};

// Get user's notification history
const getUserNotifications = (userId) => {
  return notificationHistory.get(userId) || [];
};

// Mark notification as read
const markNotificationAsRead = (userId, notificationId) => {
  const userNotifications = notificationHistory.get(userId);
  if (userNotifications) {
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notificationHistory.set(userId, userNotifications);
    }
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = (userId) => {
  const userNotifications = notificationHistory.get(userId);
  if (userNotifications) {
    userNotifications.forEach(notification => {
      notification.read = true;
    });
    notificationHistory.set(userId, userNotifications);
  }
};

module.exports = {
  initializeWebSocket,
  sendUserNotification,
  broadcastNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};