// src/components/NotificationDropdown.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  subscribeToNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService";
import { Bell, Check, CheckCheck, Clock, User } from "lucide-react";

const NotificationDropdown = ({ userId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.log("❌ No userId provided to NotificationDropdown");
      setLoading(false);
      return;
    }

    console.log("🔔 Setting up notifications subscription for userId:", userId);
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToNotifications(userId, (notifs) => {
        console.log("📬 Received notifications:", notifs.length);
        setNotifications(notifs);
        setLoading(false);
        setError(null);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error("❌ Error setting up notifications:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [userId]);

  const groupNotificationsByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [],
      yesterday: [],
      older: [],
    };

    notifications.forEach((notif) => {
      if (!notif.createdAt) {
        groups.older.push(notif);
        return;
      }

      try {
        const notifDate = notif.createdAt.toDate();
        notifDate.setHours(0, 0, 0, 0);

        if (notifDate.getTime() === today.getTime()) {
          groups.today.push(notif);
        } else if (notifDate.getTime() === yesterday.getTime()) {
          groups.yesterday.push(notif);
        } else {
          groups.older.push(notif);
        }
      } catch (err) {
        console.error("Error processing notification date:", err);
        groups.older.push(notif);
      }
    });

    return groups;
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      // Close dropdown
      onClose();
      // Navigate to destination
      navigate(notification.url);
    } catch (err) {
      console.error("Error handling notification click:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(userId);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return <User className="w-4 h-4 text-blue-600" />;
      case "task_created":
        return <Clock className="w-4 h-4 text-green-600" />;
      case "task_updated":
        return <Bell className="w-4 h-4 text-orange-600" />;
      case "info_shared":
        return <Bell className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    } catch (err) {
      console.error("Error formatting time:", err);
      return "";
    }
  };

  if (!isOpen) return null;

  const grouped = groupNotificationsByDate();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] max-h-[600px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <Bell className="w-12 h-12 mx-auto mb-2 text-red-300" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No notifications yet</p>
            <p className="text-xs mt-2 text-gray-400">
              You'll be notified when tasks are assigned
            </p>
          </div>
        ) : (
          <>
            {/* Today */}
            {grouped.today.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Today
                  </p>
                </div>
                {grouped.today.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={() => handleNotificationClick(notif)}
                    formatTime={formatTime}
                    getIcon={getNotificationIcon}
                  />
                ))}
              </div>
            )}

            {/* Yesterday */}
            {grouped.yesterday.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Yesterday
                  </p>
                </div>
                {grouped.yesterday.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={() => handleNotificationClick(notif)}
                    formatTime={formatTime}
                    getIcon={getNotificationIcon}
                  />
                ))}
              </div>
            )}

            {/* Older */}
            {grouped.older.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Older
                  </p>
                </div>
                {grouped.older.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={() => handleNotificationClick(notif)}
                    formatTime={formatTime}
                    getIcon={getNotificationIcon}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ notification, onClick, formatTime, getIcon }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors ${
        !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 Z-[9999]">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {formatTime(notification.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;