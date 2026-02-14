import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  notifyTaskAssigned,
  notifyTaskCreated,
  notifyInfoShared,
  notifyTaskUpdated,
} from "./notificationService";

export const handleCreateAndAssignTask = async (taskData) => {
  try {
    // Get current user info (Bhoomika - CW)
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");


    const taskRef = await addDoc(collection(db, "tasks"), {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedUserId, 
      assignedToName: taskData.assignedUserName,
      department: taskData.department, 
      createdBy: currentUserId, 
      createdByName: currentUserName, 
      projectId: taskData.projectId,
      status: "pending",
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      createdAt: serverTimestamp(),
    });

    await notifyTaskAssigned({
      assignedUserId: taskData.assignedUserId, 
      assignedUserName: taskData.assignedUserName, 
      taskTitle: taskData.title,
      taskId: taskRef.id,
      projectId: taskData.projectId,
      fromUserId: currentUserId, 
      fromUserName: currentUserName, 
    });
    return { success: true, taskId: taskRef.id };
  } catch (error) {
    console.error("❌ Error creating and assigning task:", error);
    throw error;
  }
};

export const handleCreateTaskNotifyTeam = async (taskData, teamMemberIds) => {
  try {
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");
    const taskRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      createdBy: currentUserId,
      createdByName: currentUserName,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    const notificationPromises = teamMemberIds.map((memberId) =>
      notifyTaskCreated({
        userId: memberId,
        taskTitle: taskData.title,
        taskId: taskRef.id,
        projectId: taskData.projectId,
        fromUserId: currentUserId,
        fromUserName: currentUserName,
      })
    );

    await Promise.all(notificationPromises);
    return { success: true, taskId: taskRef.id };
  } catch (error) {
    console.error("❌ Error creating task:", error);
    throw error;
  }
};

export const handleShareInformation = async (infoData, recipientUserIds) => {
  try {
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");
    const infoRef = await addDoc(collection(db, "sharedInfo"), {
      ...infoData,
      sharedBy: currentUserId,
      sharedByName: currentUserName,
      sharedAt: serverTimestamp(),
    });
    const notificationPromises = recipientUserIds.map((userId) =>
      notifyInfoShared({
        userId,
        infoTitle: infoData.title,
        infoType: infoData.type, // "document", "link", "note", etc.
        url: `/dashboard/info/${infoRef.id}`,
        fromUserId: currentUserId,
        fromUserName: currentUserName,
      })
    );

    await Promise.all(notificationPromises);
    return { success: true, infoId: infoRef.id };
  } catch (error) {
    console.error("❌ Error sharing information:", error);
    throw error;
  }
};

export const handleUpdateTask = async (taskId, updates, assignedUserId) => {
  try {
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedBy: currentUserId,
      updatedAt: serverTimestamp(),
    });

    await notifyTaskUpdated({
      userId: assignedUserId,
      taskTitle: updates.title || "Task",
      taskId,
      projectId: updates.projectId,
      updateType: "updated", 
      fromUserId: currentUserId,
      fromUserName: currentUserName,
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating task:", error);
    throw error;
  }
};

export const testNotification = async (userId, userName) => {
  try {
    console.log("🧪 Testing notification system...");
    
    await notifyTaskAssigned({
      assignedUserId: userId,
      assignedUserName: userName,
      taskTitle: "Test Task",
      taskId: "test-task-123",
      projectId: "test-project-123",
      fromUserId: "test-user-123",
      fromUserName: "Test User",
    });
    
    console.log("✅ Test notification sent successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

export default {
  handleCreateAndAssignTask,
  handleCreateTaskNotifyTeam,
  handleShareInformation,
  handleUpdateTask,
  testNotification,
};
