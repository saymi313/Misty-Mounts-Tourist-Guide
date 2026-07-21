import React, { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, User } from 'lucide-react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Request notification permission on component mount
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Listen for custom notification events
    const handleCustomNotification = (event) => {
      const { title, body, type, data } = event.detail;
      addNotification({ title, body, type, data });
    };

    window.addEventListener('custom-notification', handleCustomNotification);

    return () => {
      window.removeEventListener('custom-notification', handleCustomNotification);
    };
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      title: notification.title,
      body: notification.body,
      type: notification.type || 'info',
      data: notification.data,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only last 10
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.body,
        icon: "/Logo.png",
        tag: 'chat-notification'
      });
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'user':
        return <User className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 border-blue-200';
      case 'user':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative rounded-xl p-2 text-frost-600 transition-colors duration-200 hover:bg-glacier-50 hover:text-abyss-900 dark:text-frost-300 dark:hover:bg-abyss-800 dark:hover:text-frost-50"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-clay-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-abyss-900 rounded-2xl shadow-lift border border-abyss-900/10 dark:border-frost-50/10 z-50 overflow-hidden">
          <div className="p-4 border-b border-abyss-900/8 dark:border-frost-50/8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-abyss-900 dark:text-frost-50">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-glacier-700 hover:text-glacier-600 dark:text-glacier-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-frost-400 hover:text-abyss-700 dark:hover:text-frost-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-frost-500 dark:text-frost-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-abyss-900/8 dark:border-frost-50/8 hover:bg-frost-50 dark:hover:bg-abyss-800 transition-colors duration-200 ${
                    !notification.read ? 'bg-glacier-50 dark:bg-abyss-800/60' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-abyss-900 dark:text-frost-50">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-frost-500 dark:text-frost-400">
                            {new Date(notification.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-frost-400 hover:text-abyss-700 dark:hover:text-frost-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-frost-600 dark:text-frost-300 mt-1">
                        {notification.body}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Global notification trigger function */}
      {typeof window !== 'undefined' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.triggerNotification = function(title, body, type, data) {
                window.dispatchEvent(new CustomEvent('custom-notification', {
                  detail: { title, body, type, data }
                }));
              };
            `
          }}
        />
      )}
    </div>
  );
};

export default NotificationSystem; 