// ============================================
// notificationExamples.js
// ============================================
// LOCATION: src/services/notificationExamples.js
// PURPOSE: Example usage patterns for notification system
// ============================================

import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  notifyTaskAssigned,
  notifyTaskCreated,
  notifyInfoShared,
  notifyTaskUpdated,
} from "./notificationService";

// ============================================
// EXAMPLE 1: When CW (Bhoomika) Creates & Assigns Task to GD User (Nikhil Lad)
// ============================================
// This is the main use case you mentioned:
// "CW bhoomika e graphic design na user : GD1 nikhil lad ne assigned karyu"

export const handleCreateAndAssignTask = async (taskData) => {
  try {
    // Get current user info (Bhoomika - CW)
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");

    // 1. Create the task in Firestore
    const taskRef = await addDoc(collection(db, "tasks"), {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedUserId, // e.g., "nikhil_lad_user_id"
      assignedToName: taskData.assignedUserName, // e.g., "Nikhil Lad"
      department: taskData.department, // e.g., "Graphic Design"
      createdBy: currentUserId, // Bhoomika's user ID
      createdByName: currentUserName, // "Bhoomika"
      projectId: taskData.projectId,
      status: "pending",
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      createdAt: serverTimestamp(),
    });

    // 2. 🔔 Send notification to assigned user (Nikhil Lad)
    await notifyTaskAssigned({
      assignedUserId: taskData.assignedUserId, // Nikhil's ID
      assignedUserName: taskData.assignedUserName, // "Nikhil Lad"
      taskTitle: taskData.title,
      taskId: taskRef.id,
      projectId: taskData.projectId,
      fromUserId: currentUserId, // Bhoomika's ID
      fromUserName: currentUserName, // "Bhoomika"
    });

    console.log("✅ Task created and notification sent to " + taskData.assignedUserName);
    return { success: true, taskId: taskRef.id };
  } catch (error) {
    console.error("❌ Error creating and assigning task:", error);
    throw error;
  }
};

// ============================================
// EXAMPLE 2: When Creating a Task (Notify Multiple Team Members)
// ============================================

export const handleCreateTaskNotifyTeam = async (taskData, teamMemberIds) => {
  try {
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");

    // Create task
    const taskRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      createdBy: currentUserId,
      createdByName: currentUserName,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // 🔔 Notify all team members about new task
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
    console.log("✅ Task created and all team members notified!");
    return { success: true, taskId: taskRef.id };
  } catch (error) {
    console.error("❌ Error creating task:", error);
    throw error;
  }
};

// ============================================
// EXAMPLE 3: When Sharing Information
// ============================================
// Use this when sharing documents, links, or any information

export const handleShareInformation = async (infoData, recipientUserIds) => {
  try {
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");

    // Share the information (add to database)
    const infoRef = await addDoc(collection(db, "sharedInfo"), {
      ...infoData,
      sharedBy: currentUserId,
      sharedByName: currentUserName,
      sharedAt: serverTimestamp(),
    });

    // 🔔 Notify all recipients
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
    console.log("✅ Information shared and users notified!");
    return { success: true, infoId: infoRef.id };
  } catch (error) {
    console.error("❌ Error sharing information:", error);
    throw error;
  }
};

// ============================================
// EXAMPLE 4: When Updating a Task
// ============================================

export const handleUpdateTask = async (taskId, updates, assignedUserId) => {
  try {
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");

    // Update the task
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedBy: currentUserId,
      updatedAt: serverTimestamp(),
    });

    // 🔔 Notify assigned user about update
    await notifyTaskUpdated({
      userId: assignedUserId,
      taskTitle: updates.title || "Task",
      taskId,
      projectId: updates.projectId,
      updateType: "updated", // or "completed", "status_changed", etc.
      fromUserId: currentUserId,
      fromUserName: currentUserName,
    });

    console.log("✅ Task updated and user notified!");
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating task:", error);
    throw error;
  }
};

// ============================================
// EXAMPLE 5: Complete Form Component Integration
// ============================================
// This shows how to use in a React form component

export const TaskCreateFormExample = `
import React, { useState } from "react";
import { handleCreateAndAssignTask } from "../services/notificationExamples";

const TaskCreateForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedUserId: "",
    assignedUserName: "",
    department: "",
    projectId: "",
    dueDate: "",
    priority: "medium",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ This will create task AND send notification
      const result = await handleCreateAndAssignTask(formData);
      
      alert(\`✅ Task created and notification sent to \${formData.assignedUserName}!\`);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        assignedUserId: "",
        assignedUserName: "",
        department: "",
        projectId: "",
        dueDate: "",
        priority: "medium",
      });
    } catch (error) {
      alert("❌ Error creating task: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Task Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Assign To User ID:</label>
        <input
          type="text"
          name="assignedUserId"
          value={formData.assignedUserId}
          onChange={handleChange}
          placeholder="nikhil_lad_user_id"
          required
        />
      </div>

      <div>
        <label>Assign To Name:</label>
        <input
          type="text"
          name="assignedUserName"
          value={formData.assignedUserName}
          onChange={handleChange}
          placeholder="Nikhil Lad"
          required
        />
      </div>

      <div>
        <label>Department:</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          <option value="Graphic Design">Graphic Design</option>
          <option value="Video Editor">Video Editor</option>
          <option value="Content Writer">Content Writer</option>
          <option value="Front End Developer">Front End Developer</option>
        </select>
      </div>

      <div>
        <label>Project ID:</label>
        <input
          type="text"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Due Date:</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Priority:</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Task & Send Notification 🔔"}
      </button>
    </form>
  );
};

export default TaskCreateForm;
`;

// ============================================
// EXAMPLE 6: Quick Usage in Any Component
// ============================================

// Just import and use directly:
// import { handleCreateAndAssignTask } from "../services/notificationExamples";

// Then in your function:
// await handleCreateAndAssignTask({
//   title: "Design Logo",
//   description: "Create logo for new project",
//   assignedUserId: "nikhil_lad_user_id",
//   assignedUserName: "Nikhil Lad",
//   department: "Graphic Design",
//   projectId: "project123",
//   dueDate: "2026-02-20",
//   priority: "high",
// });

// ============================================
// TESTING HELPERS
// ============================================

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

// ============================================
// EXPORTS
// ============================================

export default {
  handleCreateAndAssignTask,
  handleCreateTaskNotifyTeam,
  handleShareInformation,
  handleUpdateTask,
  testNotification,
};
