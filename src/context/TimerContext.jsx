import React, { createContext, useContext, useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLog, setTimeLog] = useState([]);

  // ✅ Calculate elapsed time from timeLog entries
  const calculateElapsedTime = (timeLog) => {
    if (!timeLog || timeLog.length === 0) return 0;
    let totalElapsed = 0;
    let lastStartTime = null;
    for (const entry of timeLog) {
      const entryTime = new Date(entry.timestamp).getTime();
      if (entry.type === "start" || entry.type === "resume") {
        lastStartTime = entryTime;
      } else if (entry.type === "pause" || entry.type === "end") {
        if (lastStartTime) {
          totalElapsed += (entryTime - lastStartTime) / 1000;
          lastStartTime = null;
        }
      }
    }

    // If still running, add time from last start to now
    if (lastStartTime) {
      totalElapsed += (Date.now() - lastStartTime) / 1000;
    }
    return Math.floor(totalElapsed);
  };

  // ✅ Track current user email in state
  const [currentUserEmail, setCurrentUserEmail] = useState(
    localStorage.getItem("userEmail"),
  );

  // ✅ Monitor localStorage for user email changes
  useEffect(() => {
    const checkUserEmail = setInterval(() => {
      const email = localStorage.getItem("userEmail");
      if (email !== currentUserEmail) {
        setCurrentUserEmail(email);
      }
    }, 500);

    return () => clearInterval(checkUserEmail);
  }, [currentUserEmail]);

  // ✅ Listen to Firebase for current user's timer
  useEffect(() => {
    if (!currentUserEmail) {
      setActiveTimer(null);
      setRemainingSeconds(0);
      setIsRunning(false);
      setTimeLog([]);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      let foundTimer = null;
      snapshot.forEach((docSnapshot) => {
        // Skip if we already found a timer for current user
        if (foundTimer) return;
        const project = docSnapshot.data();
        const userTasks = project.userTasks || [];
        // Find task for CURRENT USER only
        const userTask = userTasks.find((task) => {
          if (!task.userEmail) {
            console.log("⚠️ Task has no email");
            return false;
          }
          const taskEmail = task.userEmail.toLowerCase().trim();
          const currentEmail = currentUserEmail.toLowerCase().trim();
          // MUST match current user's email
          if (taskEmail !== currentEmail) {
            return false;
          }
          // Check if task is active (not completed)
          const isActive =
            task.taskStatus &&
            task.taskStatus !== "completed" &&
            (!task.timeLog ||
              !task.timeLog.some((entry) => entry.type === "end"));

          return isActive;
        });
        if (userTask) {
          const hours = parseInt(project.estimatedHours) || 0;
          const minutes = parseInt(project.estimatedMinutes) || 0;
          const totalSeconds = hours * 3600 + minutes * 60;
          // Calculate elapsed time from timeLog
          const elapsedSeconds = calculateElapsedTime(userTask.timeLog || []);
          const remaining = Math.max(0, totalSeconds - elapsedSeconds);

          foundTimer = {
            projectId: project.projectId,
            firebaseId: docSnapshot.id,
            clientName: project.clientName,
            serviceType: project.serviceType,
            estimatedHours: project.estimatedHours,
            estimatedMinutes: project.estimatedMinutes,
            userEmail: userTask.userEmail,
            taskStatus: userTask.taskStatus,
          };

          setActiveTimer(foundTimer);
          setRemainingSeconds(remaining);
          setIsRunning(userTask.taskStatus === "in_progress");
          setTimeLog(userTask.timeLog || []);
        }
      });

      if (!foundTimer) {
        setActiveTimer(null);
        setRemainingSeconds(0);
        setIsRunning(false);
        setTimeLog([]);
      }
    });
    return () => unsubscribe();
  }, [currentUserEmail]); // Re-run when user changes

  // ✅ Timer countdown - only when running
  useEffect(() => {
    let interval;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  // ✅ Handle logout - pause timer automatically
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      const isLoggingOut = localStorage.getItem("isLoggingOut");
      if (isLoggingOut && activeTimer && isRunning) {
        await pauseTimer("logout");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeTimer, isRunning]);

  const getCurrentUserInfo = () => {
    return {
      userId: localStorage.getItem("userId") || "unknown",
      userEmail: localStorage.getItem("userEmail") || "unknown@example.com",
      userName:
        localStorage.getItem("userName") ||
        localStorage.getItem("userEmail") ||
        "Unknown User",
    };
  };

  const getCurrentTimestamp = () => {
    return new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const updateUserTaskInFirebase = async (firebaseId, taskUpdate) => {
    try {
      const projectRef = doc(db, "projects", firebaseId);
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        const data = projectDoc.data();
        const userTasks = data.userTasks || [];
        const { userEmail } = getCurrentUserInfo();
        const userTaskIndex = userTasks.findIndex(
          (task) => task.userEmail?.toLowerCase() === userEmail?.toLowerCase(),
        );
        if (userTaskIndex >= 0) {
          userTasks[userTaskIndex] = {
            ...userTasks[userTaskIndex],
            ...taskUpdate,
            updatedAt: new Date().toISOString(),
          };
          await updateDoc(projectRef, {
            userTasks,
            updatedAt: new Date().toISOString(),
          });
          console.log("✅ Firebase updated successfully");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("❌ Error updating Firebase:", error);
      throw error;
    }
  };

  const startTimer = async (projectData) => {
    const { userEmail } = getCurrentUserInfo();
    const startEntry = {
      type: "start",
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp(),
    };

    const newTimeLog = [startEntry];

    try {
      // Check if user task already exists
      const projectRef = doc(db, "projects", projectData.firebaseId);
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.exists()) {
        const data = projectDoc.data();
        const userTasks = data.userTasks || [];

        const existingTaskIndex = userTasks.findIndex(
          (task) => task.userEmail?.toLowerCase() === userEmail?.toLowerCase(),
        );

        if (existingTaskIndex >= 0) {
          // Update existing task
          userTasks[existingTaskIndex] = {
            ...userTasks[existingTaskIndex],
            startTime: startEntry.dateTime,
            timeLog: newTimeLog,
            taskStatus: "in_progress",
            updatedAt: new Date().toISOString(),
          };
        } else {
          // Add new task
          userTasks.push({
            userId: localStorage.getItem("userId"),
            userEmail: userEmail,
            userName: getCurrentUserInfo().userName,
            startTime: startEntry.dateTime,
            timeLog: newTimeLog,
            taskStatus: "in_progress",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        await updateDoc(projectRef, {
          userTasks,
          updatedAt: new Date().toISOString(),
        });

        console.log("✅ Timer started in Firebase");
      }
    } catch (error) {
      console.error("❌ Error starting timer:", error);
    }
  };

  const pauseTimer = async (reason) => {
    if (!activeTimer) {
      console.log("❌ No active timer to pause");
      return;
    }

    const pauseEntry = {
      type: "pause",
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp(),
      reason: reason || "No reason provided",
    };

    const updatedLog = [...timeLog, pauseEntry];

    try {
      await updateUserTaskInFirebase(activeTimer.firebaseId, {
        timeLog: updatedLog,
        lastPauseReason: reason,
        taskStatus: "paused",
        pausedAt: pauseEntry.dateTime,
      });
      console.log("✅ Timer paused:", reason);
    } catch (error) {
      console.error("❌ Error pausing timer:", error);
      throw error;
    }
  };

  const resumeTimer = async () => {
    if (!activeTimer || isRunning) return;

    const resumeEntry = {
      type: "resume",
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp(),
    };

    const updatedLog = [...timeLog, resumeEntry];

    try {
      await updateUserTaskInFirebase(activeTimer.firebaseId, {
        timeLog: updatedLog,
        taskStatus: "in_progress",
        resumedAt: resumeEntry.dateTime,
      });
      console.log("✅ Timer resumed");
    } catch (error) {
      console.error("❌ Error resuming timer:", error);
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    const endEntry = {
      type: "end",
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp(),
    };

    const finalLog = [...timeLog, endEntry];

    try {
      await updateUserTaskInFirebase(activeTimer.firebaseId, {
        endTime: endEntry.dateTime,
        timeLog: finalLog,
        taskStatus: "completed",
        remainingTime: remainingSeconds,
        completedAt: new Date().toISOString(),
      });
      console.log("✅ Timer stopped");
    } catch (error) {
      console.error("❌ Error stopping timer:", error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!activeTimer) return 0;
    const hours = parseInt(activeTimer.estimatedHours) || 0;
    const minutes = parseInt(activeTimer.estimatedMinutes) || 0;
    const total = hours * 3600 + minutes * 60;
    if (total === 0) return 0;
    return ((total - remainingSeconds) / total) * 100;
  };

  const value = {
    activeTimer,
    remainingSeconds,
    isRunning,
    timeLog,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    formatTime,
    getProgressPercentage,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};
