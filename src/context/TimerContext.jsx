import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLog, setTimeLog] = useState([]);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userId, setUserId] = useState(localStorage.getItem('userId')); // ✅ Add userId to state

  // ✅ Check if timeLog has an end entry
  const hasEndTime = (timeLog) => {
    if (!timeLog || timeLog.length === 0) return false;
    return timeLog.some(entry => entry.type === 'end');
  };

  // ✅ Calculate elapsed time from timeLog entries
  const calculateElapsedTime = (timeLog) => {
    if (!timeLog || timeLog.length === 0) return 0;

    let totalElapsed = 0;
    let lastStartTime = null;

    for (const entry of timeLog) {
      const entryTime = new Date(entry.timestamp).getTime();

      if (entry.type === 'start' || entry.type === 'resume') {
        lastStartTime = entryTime;
      } else if (entry.type === 'pause' || entry.type === 'end') {
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

  // ✅ Watch for changes to userEmail AND userId in localStorage
  useEffect(() => {
    const checkUserInfo = setInterval(() => {
      const currentEmail = localStorage.getItem('userEmail');
      const currentUserId = localStorage.getItem('userId');
      
      if (currentEmail !== userEmail) {
        console.log('👤 User email changed to:', currentEmail);
        setUserEmail(currentEmail);
      }
      
      if (currentUserId !== userId) {
        console.log('👤 User ID changed to:', currentUserId);
        setUserId(currentUserId);
      }
    }, 100);

    return () => clearInterval(checkUserInfo);
  }, [userEmail, userId]);

  // ✅ Listen to Firebase when user info is available
  useEffect(() => {
    // ✅ Get fresh values from localStorage each time
    const currentUserEmail = localStorage.getItem('userEmail');
    const currentUserId = localStorage.getItem('userId');

    if (!currentUserEmail || !currentUserId) {
      console.log('❌ No user info - waiting for login');
      setActiveTimer(null);
      setRemainingSeconds(0);
      setIsRunning(false);
      setTimeLog([]);
      return;
    }

    console.log('👤 Setting up Firebase listener for:', currentUserEmail, 'ID:', currentUserId);

    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      let foundTimer = null;

      // ✅ Get FRESH user info inside the snapshot listener
      const freshUserEmail = localStorage.getItem('userEmail');
      const freshUserId = localStorage.getItem('userId');

      console.log('🔄 Scanning projects for user:', freshUserEmail, 'ID:', freshUserId);

      snapshot.forEach((doc) => {
        const project = doc.data();
        const userTasks = project.userTasks || [];

        // Find task that belongs to CURRENT USER ONLY
        const userTask = userTasks.find(task => {
          // ✅ STEP 1: Check userId FIRST (most reliable)
          if (task.userId && freshUserId) {
            if (task.userId !== freshUserId) {
              return false; // Not this user's task
            }
          } else if (task.userEmail && freshUserEmail) {
            // ✅ Fallback to email comparison if userId not available
            const taskEmailLower = task.userEmail.toLowerCase().trim();
            const currentEmailLower = freshUserEmail.toLowerCase().trim();
            
            if (taskEmailLower !== currentEmailLower) {
              return false; // Not this user's task
            }
          } else {
            console.log('⚠️ Task missing both userId and userEmail');
            return false;
          }

          // ✅ STEP 2: Validate structure
          if (!task.taskStatus) {
            console.log('⚠️ Task missing status for current user:', freshUserEmail);
            return false;
          }

          // ✅ STEP 3: Task must be in_progress or paused (not completed)
          const isActiveStatus = task.taskStatus === 'in_progress' || task.taskStatus === 'paused';
          
          if (!isActiveStatus) {
            return false;
          }

          // ✅ STEP 4: Check timeLog for end entries (no completed tasks)
          const hasNoEndInLog = !hasEndTime(task.timeLog);
          
          if (!hasNoEndInLog) {
            return false;
          }

          // ✅ STEP 5: Check noEndTime flag
          if (task.hasOwnProperty('noEndTime') && task.noEndTime === false) {
            return false;
          }

          console.log('✅ Found valid active task:', {
            projectId: project.projectId,
            taskUserId: task.userId,
            taskEmail: task.userEmail,
            currentUserId: freshUserId,
            currentEmail: freshUserEmail,
            status: task.taskStatus
          });

          return true;
        });

        if (userTask) {
          console.log('✅ Found active timer for:', freshUserEmail, '- Status:', userTask.taskStatus);

          const hours = parseInt(project.estimatedHours) || 0;
          const minutes = parseInt(project.estimatedMinutes) || 0;
          const totalSeconds = (hours * 3600) + (minutes * 60);

          // Calculate elapsed time from timeLog
          const elapsedSeconds = calculateElapsedTime(userTask.timeLog || []);
          const remaining = Math.max(0, totalSeconds - elapsedSeconds);

          console.log('📊 Timer stats:', {
            total: totalSeconds,
            elapsed: elapsedSeconds,
            remaining: remaining,
            status: userTask.taskStatus
          });

          foundTimer = {
            projectId: project.projectId,
            firebaseId: doc.id,
            clientName: project.clientName,
            serviceType: project.serviceType,
            estimatedHours: project.estimatedHours,
            estimatedMinutes: project.estimatedMinutes,
            userEmail: userTask.userEmail,
            userId: userTask.userId,
            taskStatus: userTask.taskStatus
          };

          setActiveTimer(foundTimer);
          setRemainingSeconds(remaining);
          setIsRunning(userTask.taskStatus === 'in_progress');
          setTimeLog(userTask.timeLog || []);
        }
      });

      if (!foundTimer) {
        console.log('❌ No active timer found for:', freshUserEmail);
        setActiveTimer(null);
        setRemainingSeconds(0);
        setIsRunning(false);
        setTimeLog([]);
      }
    });

    return () => unsubscribe();
  }, [userEmail, userId]); // ✅ Depend on both userEmail AND userId

  // ✅ Timer countdown - only when running
  useEffect(() => {
    let interval;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  const getCurrentUserInfo = () => {
    return {
      userId: localStorage.getItem('userId') || 'unknown',
      userEmail: localStorage.getItem('userEmail') || 'unknown@example.com',
      userName: localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Unknown User'
    };
  };

  const getCurrentTimestamp = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const updateUserTaskInFirebase = async (firebaseId, taskUpdate) => {
    try {
      const projectRef = doc(db, 'projects', firebaseId);
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.exists()) {
        const data = projectDoc.data();
        const userTasks = data.userTasks || [];
        const { userId } = getCurrentUserInfo();

        const userTaskIndex = userTasks.findIndex(task => task.userId === userId);

        if (userTaskIndex >= 0) {
          userTasks[userTaskIndex] = {
            ...userTasks[userTaskIndex],
            ...taskUpdate,
            updatedAt: new Date().toISOString()
          };

          await updateDoc(projectRef, {
            userTasks,
            updatedAt: new Date().toISOString()
          });
          console.log('✅ User task updated in Firebase');
          return true;
        } else {
          console.error('❌ User task not found for userId:', userId);
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating user task:', error);
      throw error;
    }
  };

  const startTimer = async (projectData) => {
    console.log('⏱️ Timer will be picked up by Firebase listener');
  };

  const pauseTimer = async (reason) => {
    if (!activeTimer) {
      console.log('❌ No active timer to pause');
      return;
    }

    const pauseEntry = {
      type: 'pause',
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp(),
      reason: reason || 'No reason provided'
    };

    const updatedLog = [...timeLog, pauseEntry];

    try {
      console.log('⏸️ Pausing timer with reason:', reason);
      await updateUserTaskInFirebase(activeTimer.firebaseId, {
        timeLog: updatedLog,
        lastPauseReason: reason,
        taskStatus: 'paused',
        pausedAt: pauseEntry.dateTime
      });
      console.log('✅ Timer paused successfully');
    } catch (error) {
      console.error('❌ Error saving pause:', error);
      throw error;
    }
  };

  const resumeTimer = async () => {
    if (!activeTimer || isRunning) return;

    const resumeEntry = {
      type: 'resume',
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp()
    };

    const updatedLog = [...timeLog, resumeEntry];

    try {
      await updateUserTaskInFirebase(activeTimer.firebaseId, {
        timeLog: updatedLog,
        taskStatus: 'in_progress',
        resumedAt: resumeEntry.dateTime
      });
      console.log('▶️ Timer resumed');
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    const endEntry = {
      type: 'end',
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp()
    };

    const finalLog = [...timeLog, endEntry];

    try {
      await updateUserTaskInFirebase(activeTimer.firebaseId, {
        endTime: endEntry.dateTime,
        timeLog: finalLog,
        taskStatus: 'completed',
        remainingTime: remainingSeconds,
        completedAt: new Date().toISOString()
      });
      console.log('⏹️ Timer stopped');
    } catch (error) {
      console.error('Error saving end time:', error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!activeTimer) return 0;
    const hours = parseInt(activeTimer.estimatedHours) || 0;
    const minutes = parseInt(activeTimer.estimatedMinutes) || 0;
    const total = (hours * 3600) + (minutes * 60);
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
    getProgressPercentage
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};