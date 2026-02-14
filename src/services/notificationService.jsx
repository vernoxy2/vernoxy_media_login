// src/services/notificationService.js
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

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

export const subscribeToNotifications = (userId, callback) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false), // ✅ ONLY UNREAD notifications
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          let createdAt = null;
          if (data.createdAt) {
            if (data.createdAt.toDate) {
              createdAt = data.createdAt;
            } else if (data.createdAt.seconds) {
              createdAt = new Timestamp(
                data.createdAt.seconds,
                data.createdAt.nanoseconds,
              );
            }
          }

          notifications.push({
            id: doc.id,
            ...data,
            createdAt: createdAt,
          });
        });

        // Sort by newest first
        notifications.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });

        console.log("✅ Unread notifications loaded:", notifications.length);
        callback(notifications);
      },
      (error) => {
        console.error("❌ Error subscribing to notifications:", error);
        callback([]);
      },
    );
  } catch (error) {
    console.error("❌ Error setting up notification subscription:", error);
    return () => {};
  }
};

// ✅ Mark single notification as read
export const markAsRead = async (notificationId) => {
  try {
    console.log("📝 Marking notification as read:", notificationId);

    if (!notificationId) {
      throw new Error("No notification ID provided");
    }

    const notificationRef = doc(db, "notifications", notificationId);

    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    });

    console.log("✅ Successfully marked as read:", notificationId);
    return true;
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    throw error;
  }
};

// ✅ Mark all notifications as read for a user
export const markAllAsRead = async (userId) => {
  try {
    console.log("📝 Marking all notifications as read for user:", userId);

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
       where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = [];

    snapshot.forEach((document) => {
      const notificationRef = doc(db, "notifications", document.id);
      updatePromises.push(
        updateDoc(notificationRef, {
          read: true,
          readAt: serverTimestamp(),
        }),
      );
    });

    await Promise.all(updatePromises);
    console.log(`✅ Marked ${updatePromises.length} notifications as read`);
    return true;
  } catch (error) {
    console.error("❌ Error marking all notifications as read:", error);
    throw error;
  }
};

// ✅ Notify when task is assigned to a user
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
    url: `/dashboard/projects`,
    fromUserId,
    fromUserName,
    metadata: { taskId, projectId, taskTitle },
  });
};

// ✅ Notify when a new task is created
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

// ✅ Notify when information is shared
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

// ✅ Notify when a task is updated
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
