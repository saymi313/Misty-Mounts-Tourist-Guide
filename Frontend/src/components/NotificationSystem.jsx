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
        className="relative rounded-xl p-2 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-lime-400 text-night-950 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-night-800 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden">
          <div className="p-4 border-b border-white/8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-lime-400 hover:text-lime-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-white/40">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/8 hover:bg-night-700 transition-colors duration-200 ${
                    !notification.read ? 'bg-lime-400/5' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-white/40">
                            {new Date(notification.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-white/40 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 mt-1">
                        {notification.body}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-lime-400 hover:text-lime-300 mt-2"
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