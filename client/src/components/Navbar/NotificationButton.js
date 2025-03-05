import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-panel')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setIsOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setError(null);
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setError(null);
        }}
        className="relative p-2 rounded-full text-white hover:text-orange-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200"
        aria-label="Toggle notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-orange-500 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-md rounded-lg shadow-lg py-1 z-50 border border-white/20 transform transition-all duration-200">
          <div className="px-4 py-2 border-b border-white/10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-orange-300 hover:text-orange-200 transition-colors duration-200"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {error && (
              <div className="flex items-center text-red-400 text-sm mt-2">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors duration-200 ${!notification.read ? 'bg-orange-500/10' : ''}`}
                >
                  <p className="text-sm font-medium text-white">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-300 text-center">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
