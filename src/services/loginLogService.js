// src/services/loginLogService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Log user login
 * @param {string} userId - User's UID from Firebase Auth
 * @param {string} email - User's email
 * @param {string} role - User's role (admin/user)
 * @param {string} department - User's department
 * @param {string} userName - User's name
 * @returns {Promise<string>} - Document ID of the created log
 */
export const logUserLogin = async (userId, email, role, department = "", userName = "") => {
  try {
    const loginLogRef = collection(db, "loginLogs");
    
    const loginData = {
      userId,
      email,
      role,
      department,
      userName,
      loginTime: serverTimestamp(),
      logoutTime: null,
      sessionDuration: null,
      status: "active", // active, completed
      ipAddress: null, // Optional: can be added if needed
      browser: navigator.userAgent,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(loginLogRef, loginData);
    
    // Store the log ID in localStorage for later logout update
    localStorage.setItem("currentLoginLogId", docRef.id);
    
    console.log("Login logged successfully:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error logging login:", error);
    throw error;
  }
};

/**
 * Log user logout and calculate session duration
 * @param {string} logId - The document ID of the login log (optional, will use localStorage if not provided)
 * @returns {Promise<void>}
 */
export const logUserLogout = async (logId = null) => {
  try {
    // Get log ID from parameter or localStorage
    const loginLogId = logId || localStorage.getItem("currentLoginLogId");
    
    if (!loginLogId) {
      console.warn("No active login session found to log logout");
      return;
    }

    const loginLogRef = doc(db, "loginLogs", loginLogId);
    const now = Timestamp.now();
    
    // Update the login log with logout time
    await updateDoc(loginLogRef, {
      logoutTime: now,
      status: "completed",
      updatedAt: serverTimestamp(),
    });

    // Clear the stored log ID
    localStorage.removeItem("currentLoginLogId");
    
    console.log("Logout logged successfully:", loginLogId);
  } catch (error) {
    console.error("Error logging logout:", error);
    // Don't throw error to prevent blocking logout process
  }
};

/**
 * Get all login logs (Admin function)
 * @param {Object} filters - Optional filters
 * @param {string} filters.userId - Filter by specific user
 * @param {string} filters.role - Filter by role
 * @param {Date} filters.startDate - Filter by start date
 * @param {Date} filters.endDate - Filter by end date
 * @param {number} filters.limitCount - Limit number of results
 * @returns {Promise<Array>} - Array of login logs
 */
export const getLoginLogs = async (filters = {}) => {
  try {
    let q = query(
      collection(db, "loginLogs"),
      orderBy("loginTime", "desc")
    );

    // Apply filters
    if (filters.userId) {
      q = query(q, where("userId", "==", filters.userId));
    }
    
    if (filters.role) {
      q = query(q, where("role", "==", filters.role));
    }

    if (filters.limitCount) {
      q = query(q, limit(filters.limitCount));
    }

    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Calculate session duration if both login and logout times exist
      let sessionDuration = null;
      if (data.loginTime && data.logoutTime) {
        const loginTime = data.loginTime.toDate();
        const logoutTime = data.logoutTime.toDate();
        sessionDuration = Math.floor((logoutTime - loginTime) / 1000); // Duration in seconds
      }
      
      logs.push({
        id: doc.id,
        ...data,
        sessionDuration,
        loginTime: data.loginTime?.toDate() || null,
        logoutTime: data.logoutTime?.toDate() || null,
      });
    });

    return logs;
  } catch (error) {
    console.error("Error fetching login logs:", error);
    throw error;
  }
};

/**
 * Get login logs for a specific user
 * @param {string} userId - User's UID
 * @param {number} limitCount - Limit number of results (default: 10)
 * @returns {Promise<Array>} - Array of user's login logs
 */
export const getUserLoginLogs = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, "loginLogs"),
      where("userId", "==", userId),
      orderBy("loginTime", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        loginTime: data.loginTime?.toDate() || null,
        logoutTime: data.logoutTime?.toDate() || null,
      });
    });

    return logs;
  } catch (error) {
    console.error("Error fetching user login logs:", error);
    throw error;
  }
};

/**
 * Get active sessions (users currently logged in)
 * @returns {Promise<Array>} - Array of active sessions
 */
export const getActiveSessions = async () => {
  try {
    const q = query(
      collection(db, "loginLogs"),
      where("status", "==", "active"),
      orderBy("loginTime", "desc")
    );

    const querySnapshot = await getDocs(q);
    const activeSessions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      activeSessions.push({
        id: doc.id,
        ...data,
        loginTime: data.loginTime?.toDate() || null,
      });
    });

    return activeSessions;
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    throw error;
  }
};

/**
 * Format session duration to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatSessionDuration = (seconds) => {
  if (!seconds) return "N/A";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};