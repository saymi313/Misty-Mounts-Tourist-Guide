import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, MessageSquare, User, CalendarCheck, AlertTriangle, Tag, Star, Check } from 'lucide-react';
import {
  getNotifications, saveNotifications, subscribeNotifications, unreadCountOf,
  fetchNotifications, markRead as sMarkRead, markAllRead as sMarkAllRead,
  removeNotification as sRemove,
} from '../utils/notificationsStore';
import { timeAgo } from '../utils/datetime';

const iconFor = (type) => {
  switch (type) {
    case 'booking': return <CalendarCheck className="h-5 w-5 text-lime-400" />;
    case 'guide':
    case 'message': return <MessageSquare className="h-5 w-5 text-sky-400" />;
    case 'alert': return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    case 'price': return <Tag className="h-5 w-5 text-emerald-400" />;
    case 'review': return <Star className="h-5 w-5 text-amber-400" />;
    case 'user': return <User className="h-5 w-5 text-lime-400" />;
    default: return <Bell className="h-5 w-5 text-white/60" />;
  }
};

/**
 * Navbar notification bell. Shares state with the /notifications page via the
 * localStorage-backed notifications store, so read/removed state stays in sync.
 */
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState(getNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  // Live-sync with the store (updates made on the /notifications page reflect here).
  useEffect(() => {
    fetchNotifications();
    return subscribeNotifications(() => setNotifications([...getNotifications()]));
  }, []);

  // Let other code push a notification via a window event (e.g. a chat reply).
  useEffect(() => {
    const handler = (event) => {
      const { title, body, type } = event.detail || {};
      const item = {
        _id: `nt-${Date.now()}`, type: type || 'system', title, body,
        time: new Date().toISOString(), read: false, link: '/notifications',
      };
      saveNotifications([item, ...getNotifications()]);
    };
    window.addEventListener('custom-notification', handler);
    return () => window.removeEventListener('custom-notification', handler);
  }, []);

  const unreadCount = unreadCountOf(notifications);
  const markAsRead = (id) => sMarkRead(id);
  const markAllAsRead = () => sMarkAllRead();
  const removeNotification = (id) => sRemove(id);

  return (
    <div className="relative">
      {/* Bell */}
      <button
        onClick={() => setShowNotifications((v) => !v)}
        className="relative rounded-xl p-2 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-xs font-bold text-night-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-night-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/8 p-4">
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-sm text-lime-400 hover:text-lime-300">
                  Mark all read
                </button>
              )}
              <button onClick={() => setShowNotifications(false)} className="text-white/40 hover:text-white" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-white/40">No notifications</div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n._id}
                  className={`border-b border-white/8 p-4 transition-colors hover:bg-night-700 ${!n.read ? 'bg-lime-400/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">{n.title}</p>
                        <span className="shrink-0 text-xs text-white/40">{timeAgo(n.time)}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/60">{n.body}</p>
                      <div className="mt-2 flex items-center gap-3">
                        {!n.read && (
                          <button onClick={() => markAsRead(n._id)} className="inline-flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300">
                            <Check className="h-3 w-3" /> Mark read
                          </button>
                        )}
                        <button onClick={() => removeNotification(n._id)} className="text-xs text-white/40 hover:text-rose-400">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setShowNotifications(false)}
            className="block border-t border-white/8 px-4 py-3 text-center text-sm font-semibold text-lime-400 transition-colors hover:bg-night-700"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
