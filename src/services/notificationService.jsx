// src/services/notificationService.js
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Create a notification
 * @param {Object} notificationData
 * @param {string} notificationData.userId - User who will receive the notification
 * @param {string} notificationData.type - Type: 'task_assigned', 'task_created', 'info_shared', 'task_updated'
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.url - Destination URL when clicked
 * @param {string} notificationData.fromUserId - User who triggered the action
 * @param {string} notificationData.fromUserName - Name of user who triggered
 * @param {Object} notificationData.metadata - Additional data (taskId, projectId, etc.)
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      url: notificationData.url,
      fromUserId: notificationData.fromUserId,
      fromUserName: notificationData.fromUserName,
      metadata: notificationData.metadata || {},
      read: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "notifications"), notification);
    console.log("✅ Notification created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    throw error;
  }
};

/**
 * Subscribe to user's notifications
 * @param {string} userId - Current user ID
 * @param {Function} callback - Callback function that receives notifications array
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = (userId, callback) => {
  try {
    // Create query WITHOUT orderBy first to avoid index issues
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Convert Firestore Timestamp to Date object
          let createdAt = null;
          if (data.createdAt) {
            if (data.createdAt.toDate) {
              createdAt = data.createdAt;
            } else if (data.createdAt.seconds) {
              createdAt = new Timestamp(
                data.createdAt.seconds,
                data.createdAt.nanoseconds
              );
            }
          }

          notifications.push({
            id: doc.id,
            ...data,
            createdAt: createdAt,
          });
        });

        // Sort by createdAt in JavaScript (newest first)
        notifications.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });

        console.log("✅ Notifications loaded:", notifications.length);
        callback(notifications);
      },
      (error) => {
        console.error("❌ Error subscribing to notifications:", error);
        // Return empty array on error to prevent infinite loading
        callback([]);
      }
    );
  } catch (error) {
    console.error("❌ Error setting up notifications subscription:", error);
    // Return a no-op unsubscribe function
    return () => {};
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 */
export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
    console.log("✅ Notification marked as read:", notificationId);
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 */
export const markAllAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = [];

    snapshot.forEach((document) => {
      const notificationRef = doc(db, "notifications", document.id);
      updatePromises.push(updateDoc(notificationRef, { read: true }));
    });

    await Promise.all(updatePromises);
    console.log("✅ All notifications marked as read");
  } catch (error) {
    console.error("❌ Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Helper function to create task assigned notification
 */
export const notifyTaskAssigned = async ({
  assignedUserId,
  assignedUserName,
  taskTitle,
  taskId,
  projectId,
  fromUserId,
  fromUserName,
}) => {
  return createNotification({
    userId: assignedUserId,
    type: "task_assigned",
    title: "New Task Assigned",
    message: `${fromUserName} assigned you a task: "${taskTitle}"`,
    url: `/dashboard/projects`, // Changed to projects list page
    fromUserId,
    fromUserName,
    metadata: { taskId, projectId, taskTitle },
  });
};

/**
 * Helper function to create task created notification
 */
export const notifyTaskCreated = async ({
  userId,
  taskTitle,
  taskId,
  projectId,
  fromUserId,
  fromUserName,
}) => {
  return createNotification({
    userId,
    type: "task_created",
    title: "New Task Created",
    message: `${fromUserName} created a new task: "${taskTitle}"`,
    url: `/dashboard/projects`,
    fromUserId,
    fromUserName,
    metadata: { taskId, projectId, taskTitle },
  });
};

/**
 * Helper function to create info shared notification
 */
export const notifyInfoShared = async ({
  userId,
  infoTitle,
  infoType,
  url,
  fromUserId,
  fromUserName,
}) => {
  return createNotification({
    userId,
    type: "info_shared",
    title: "Information Shared",
    message: `${fromUserName} shared ${infoType}: "${infoTitle}"`,
    url,
    fromUserId,
    fromUserName,
    metadata: { infoTitle, infoType },
  });
};

/**
 * Helper function to create task updated notification
 */
export const notifyTaskUpdated = async ({
  userId,
  taskTitle,
  taskId,
  projectId,
  updateType,
  fromUserId,
  fromUserName,
}) => {
  return createNotification({
    userId,
    type: "task_updated",
    title: "Task Updated",
    message: `${fromUserName} ${updateType} the task: "${taskTitle}"`,
    url: `/dashboard/projects`,
    fromUserId,
    fromUserName,
    metadata: { taskId, projectId, taskTitle, updateType },
  });
};