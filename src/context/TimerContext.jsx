import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
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
  const [activeTimer, setActiveTimer] = useState(() => {
    const saved = localStorage.getItem('activeTimer');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLog, setTimeLog] = useState([]);

  // Load timer state from localStorage on mount
  useEffect(() => {
    if (activeTimer) {
      const hours = parseInt(activeTimer.estimatedHours) || 0;
      const minutes = parseInt(activeTimer.estimatedMinutes) || 0;
      const total = (hours * 3600) + (minutes * 60);
      
      if (activeTimer.isRunning && activeTimer.lastUpdateTime) {
        const elapsed = Math.floor((Date.now() - activeTimer.lastUpdateTime) / 1000);
        const remaining = Math.max(0, (activeTimer.remainingSeconds || total) - elapsed);
        setRemainingSeconds(remaining);
        setIsRunning(true);
      } else {
        setRemainingSeconds(activeTimer.remainingSeconds || total);
        setIsRunning(false);
      }
      
      setTimeLog(activeTimer.timeLog || []);
    }
  }, []);

  // Save to localStorage whenever timer state changes
  useEffect(() => {
    if (activeTimer) {
      const timerData = {
        ...activeTimer,
        remainingSeconds,
        isRunning,
        lastUpdateTime: Date.now(),
        timeLog
      };
      localStorage.setItem('activeTimer', JSON.stringify(timerData));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [activeTimer, remainingSeconds, isRunning, timeLog]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  // Get current user info
  const getCurrentUserInfo = () => {
    return {
      userId: localStorage.getItem('userId') || 'unknown',
      userEmail: localStorage.getItem('userEmail') || 'unknown@example.com',
      userName: localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Unknown User'
    };
  };

  // Get current timestamp in readable format
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

  // Update user task in Firebase
  const updateUserTaskInFirebase = async (firebaseId, taskUpdate) => {
    try {
      const projectRef = doc(db, 'projects', firebaseId);
      const projectDoc = await getDoc(projectRef);
      
      if (projectDoc.exists()) {
        const data = projectDoc.data();
        const userTasks = data.userTasks || [];
        const { userId } = getCurrentUserInfo();
        
        const userTaskIndex = userTasks.findIndex(
          task => task.userId === userId
        );

        if (userTaskIndex >= 0) {
          // Update existing task
          userTasks[userTaskIndex] = {
            ...userTasks[userTaskIndex],
            ...taskUpdate,
            updatedAt: new Date().toISOString()
          };
          
          await updateDoc(projectRef, { 
            userTasks,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Create new task
          await updateDoc(projectRef, {
            userTasks: arrayUnion({
              userId,
              ...taskUpdate,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error updating user task:', error);
      throw error;
    }
  };

  const startTimer = async (projectData) => {
    const hours = parseInt(projectData.estimatedHours) || 0;
    const minutes = parseInt(projectData.estimatedMinutes) || 0;
    const total = (hours * 3600) + (minutes * 60);
    
    const startEntry = {
      type: 'start',
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp()
    };

    const newTimeLog = [startEntry];

    setActiveTimer({
      projectId: projectData.projectId,
      firebaseId: projectData.firebaseId,
      clientName: projectData.clientName,
      serviceType: projectData.serviceType,
      estimatedHours: projectData.estimatedHours,
      estimatedMinutes: projectData.estimatedMinutes,
      startTime: startEntry.dateTime,
      timeLog: newTimeLog
    });
    
    setRemainingSeconds(total);
    setTimeLog(newTimeLog);
    setIsRunning(true);

    // Update Firebase immediately
    try {
      await updateUserTaskInFirebase(projectData.firebaseId, {
        startTime: startEntry.dateTime,
        timeLog: newTimeLog,
        taskStatus: 'in_progress',
        estimatedHours: projectData.estimatedHours,
        estimatedMinutes: projectData.estimatedMinutes
      });
    } catch (error) {
      console.error('Error saving start time to Firestore:', error);
    }
  };

  const pauseTimer = async (reason) => {
    if (!activeTimer || !isRunning) return;

    const pauseEntry = {
      type: 'pause',
      timestamp: new Date().toISOString(),
      dateTime: getCurrentTimestamp(),
      reason: reason || 'No reason provided'
    };

    const updatedLog = [...timeLog, pauseEntry];
    setTimeLog(updatedLog);
    setIsRunning(false);

    try {
      await updateUserTaskInFirebase(activeTimer.firebaseId, {
        timeLog: updatedLog,
        lastPauseReason: reason,
        taskStatus: 'paused',
        pausedAt: pauseEntry.dateTime
      });
    } catch (error) {
      console.error('Error saving pause to Firestore:', error);
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
    setTimeLog(updatedLog);
    setIsRunning(true);

    try {
      await updateUserTaskInFirebase(activeTimer.firebaseId, {
        timeLog: updatedLog,
        taskStatus: 'in_progress',
        resumedAt: resumeEntry.dateTime
      });
    } catch (error) {
      console.error('Error saving resume to Firestore:', error);
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
    } catch (error) {
      console.error('Error saving end time to Firestore:', error);
    }

    setActiveTimer(null);
    setRemainingSeconds(0);
    setIsRunning(false);
    setTimeLog([]);
  };

  const handleTimerComplete = async () => {
    await stopTimer();
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