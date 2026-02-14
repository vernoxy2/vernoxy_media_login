import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  subscribeToNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService";
import { Bell, CheckCheck, Clock, User } from "lucide-react";

const NotificationDropdown = ({ userId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Track IDs that are being marked as read (pending)
  // onSnapshot re-fire થાય ત્યારે આ IDs filter out થઈ જશે
  const pendingReadIds = useRef(new Set());

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = subscribeToNotifications(userId, (notifs) => {
      // ✅ Filter out any notifications that are pending to be marked as read
      const filtered = notifs.filter(
        (n) => !pendingReadIds.current.has(n.id)
      );

      setNotifications(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
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

      const notifDate = notif.createdAt.toDate();
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.today.push(notif);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notif);
      } else {
        groups.older.push(notif);
      }
    });

    return groups;
  };

  // ✅ Handle notification click
  const handleNotificationClick = async (notification) => {
    console.log("🔔 Notification clicked:", notification.id);

    try {
      // ✅ STEP 1: Add to pending set so onSnapshot re-fire ignore it
      pendingReadIds.current.add(notification.id);

      // ✅ STEP 2: Remove from UI immediately (optimistic update)
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

      // ✅ STEP 3: Close dropdown
      onClose();

      // ✅ STEP 4: Navigate to the URL
      navigate(notification.url);

      // ✅ STEP 5: Mark as read in Firebase
      await markAsRead(notification.id);

      // ✅ STEP 6: Remove from pending set after Firestore update done
      pendingReadIds.current.delete(notification.id);

      console.log("✅ Notification removed and marked as read:", notification.id);
    } catch (error) {
      console.error("❌ Error handling notification click:", error);
      // ✅ On error: remove from pending and restore notification
      pendingReadIds.current.delete(notification.id);
      setNotifications((prev) =>
        [...prev, notification].sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        })
      );
    }
  };

  // ✅ Mark all as read
  const handleMarkAllRead = async () => {
    try {
      console.log("📝 Marking all notifications as read");

      // ✅ Add all current IDs to pending set
      notifications.forEach((n) => pendingReadIds.current.add(n.id));

      // ✅ Clear UI immediately
      setNotifications([]);

      // ✅ Update in Firebase
      await markAllAsRead(userId);

      // ✅ Clear pending set
      pendingReadIds.current.clear();

      console.log("✅ All notifications marked as read");
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
      pendingReadIds.current.clear();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return <User className="w-4 h-4 text-blue-600" />;
      case "task_created":
        return <Clock className="w-4 h-4 text-green-600" />;
      case "task_updated":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "info_shared":
        return <Bell className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

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
  };

  if (!isOpen) return null;

  const grouped = groupNotificationsByDate();
  const unreadCount = notifications.length;

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
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No new notifications</p>
            <p className="text-xs mt-1 text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <>
            {grouped.today.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
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

            {grouped.yesterday.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
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

            {grouped.older.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
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

// ✅ Individual notification item component
const NotificationItem = ({ notification, onClick, formatTime, getIcon }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors bg-blue-50/50 dark:bg-blue-950/20"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-600 flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {notification.title}
            </p>
            {/* Unread indicator dot */}
            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>

          {/* Time */}
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(notification.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;