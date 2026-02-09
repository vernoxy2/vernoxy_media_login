// // src/services/loginLogService.js
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   doc,
//   serverTimestamp,
//   query,
//   where,
//   orderBy,
//   getDocs,
//   limit,
//   Timestamp
// } from "firebase/firestore";
// import {
//   db
// } from "../firebase";

// /**
//  * Log user login
//  * @param {string} userId - User's UID from Firebase Auth
//  * @param {string} email - User's email
//  * @param {string} role - User's role (admin/user)
//  * @param {string} department - User's department
//  * @param {string} userName - User's name
//  * @returns {Promise<string>} - Document ID of the created log
//  */
// // export const logUserLogin = async (userId, email, role, department = "", userName = "") => {
// //   try {
// //     const loginLogRef = collection(db, "loginLogs");

// //     const loginData = {
// //       userId,
// //       email,
// //       role,
// //       department,
// //       userName,
// //       loginTime: serverTimestamp(),
// //       logoutTime: null,
// //       sessionDuration: null,
// //       status: "active", // active, completed
// //       ipAddress: null, // Optional: can be added if needed
// //       browser: navigator.userAgent,
// //       createdAt: serverTimestamp(),
// //     };

// //     const docRef = await addDoc(loginLogRef, loginData);

// //     // Store the log ID in localStorage for later logout update
// //     localStorage.setItem("currentLoginLogId", docRef.id);

// //     console.log("Login logged successfully:", docRef.id);
// //     return docRef.id;
// //   } catch (error) {
// //     console.error("Error logging login:", error);
// //     throw error;
// //   }
// // };

// export const logUserLogin = async (userId, email, role, department = "", userName = "") => {
//   try {
//     const loginLogRef = collection(db, "loginLogs");
//     const dateString = new Date().toISOString().split('T')[0];

//     // ✅ Simple query - માત્ર userId (Index waiting કરતા આ use કરો)
//     const userEntriesQuery = query(
//       loginLogRef,
//       where("userId", "==", userId)
//     );

//     const snapshot = await getDocs(userEntriesQuery);
    
//     // ✅ Client-side માં આજની entry શોધો
//     let todayEntry = null;
//     snapshot.forEach((doc) => {
//       const data = doc.data();
//       if (data.date === dateString) {
//         todayEntry = { id: doc.id, data };
//       }
//     });

//     // ✅ જો આજે entry મળે
//     if (todayEntry) {
//       const existingLogId = todayEntry.id;
//       const existingData = todayEntry.data;
      
//       // ✅ Completed હોય તો reactivate કરો
//       if (existingData.status === "completed" || existingData.status === "auto-completed") {
//         await updateDoc(doc(db, "loginLogs", existingLogId), {
//           logoutTime: null,
//           status: "active",
//           updatedAt: serverTimestamp(),
//         });
//         console.log("✅ Reactivated existing entry - logout time cleared");
//       }

//       localStorage.setItem("currentLoginLogId", existingLogId);
      
//       console.log("✅ Using existing entry from today!");
//       console.log("✅ Original login time:", existingData.loginTime?.toDate());
//       console.log("✅ Log ID:", existingLogId);
      
//       return existingLogId;
//     }

//     // ✅ આજે કોઈ entry નથી - નવી બનાવો
//     const loginData = {
//       userId,
//       email,
//       role,
//       department,
//       userName,
//       loginTime: serverTimestamp(),
//       logoutTime: null,
//       sessionDuration: null,
//       status: "active",
//       date: dateString,
//       ipAddress: null,
//       browser: navigator.userAgent,
//       createdAt: serverTimestamp(),
//     };

//     const docRef = await addDoc(loginLogRef, loginData);
//     localStorage.setItem("currentLoginLogId", docRef.id);
//     console.log("✅ First login of the day - new entry created:", docRef.id);
//     return docRef.id;
    
//   } catch (error) {
//     console.error("Error logging login:", error);
//     throw error;
//   }
// };

// export const logUserLogout = async (logId = null) => {
//   try {
//     // Get log ID from parameter or localStorage
//     const loginLogId = logId || localStorage.getItem("currentLoginLogId");

//     if (!loginLogId) {
//       console.warn("No active login session found to log logout");
//       return;
//     }

//     const loginLogRef = doc(db, "loginLogs", loginLogId);
//     const now = Timestamp.now();

//     // Update the login log with logout time
//     await updateDoc(loginLogRef, {
//       logoutTime: now,
//       status: "completed",
//       updatedAt: serverTimestamp(),
//     });

//     // Clear the stored log ID
//     localStorage.removeItem("currentLoginLogId");

//     console.log("Logout logged successfully:", loginLogId);
//   } catch (error) {
//     console.error("Error logging logout:", error);
//     // Don't throw error to prevent blocking logout process
//   }
// };

// export const getLoginLogs = async (filters = {}) => {
//   try {
//     let q = query(
//       collection(db, "loginLogs"),
//       orderBy("loginTime", "desc")
//     );

//     // Apply filters
//     if (filters.userId) {
//       q = query(q, where("userId", "==", filters.userId));
//     }

//     if (filters.role) {
//       q = query(q, where("role", "==", filters.role));
//     }

//     if (filters.limitCount) {
//       q = query(q, limit(filters.limitCount));
//     }

//     const querySnapshot = await getDocs(q);
//     const logs = [];

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();

//       // Calculate session duration if both login and logout times exist
//       let sessionDuration = null;
//       if (data.loginTime && data.logoutTime) {
//         const loginTime = data.loginTime.toDate();
//         const logoutTime = data.logoutTime.toDate();
//         sessionDuration = Math.floor((logoutTime - loginTime) / 1000); // Duration in seconds
//       }

//       logs.push({
//         id: doc.id,
//         ...data,
//         sessionDuration,
//         loginTime: data.loginTime ? data.loginTime.toDate() : null,
//         logoutTime: data.logoutTime ? data.logoutTime.toDate() : null,
//       });
//     });

//     return logs;
//   } catch (error) {
//     console.error("Error fetching login logs:", error);
//     throw error;
//   }
// };

// export const getUserLoginLogs = async (userId, limitCount = 10) => {
//   try {
//     const q = query(
//       collection(db, "loginLogs"),
//       where("userId", "==", userId),
//       orderBy("loginTime", "desc"),
//       limit(limitCount)
//     );

//     const querySnapshot = await getDocs(q);
//     const logs = [];

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       logs.push({
//         id: doc.id,
//         ...data,
//         loginTime: data.loginTime ? data.loginTime.toDate() : null,
//         logoutTime: data.logoutTime ? data.logoutTime.toDate() : null,
//       });
//     });

//     return logs;
//   } catch (error) {
//     console.error("Error fetching user login logs:", error);
//     throw error;
//   }
// };

// export const getActiveSessions = async () => {
//   try {
//     const q = query(
//       collection(db, "loginLogs"),
//       where("status", "==", "active"),
//       orderBy("loginTime", "desc")
//     );

//     const querySnapshot = await getDocs(q);
//     const activeSessions = [];

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       activeSessions.push({
//         id: doc.id,
//         ...data,
//         loginTime: data.loginTime ? data.loginTime.toDate() : null,
//       });
//     });

//     return activeSessions;
//   } catch (error) {
//     console.error("Error fetching active sessions:", error);
//     throw error;
//   }
// };

// export const formatSessionDuration = (seconds) => {
//   if (!seconds) return "N/A";

//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;

//   if (hours > 0) {
//     return `${hours}h ${minutes}m ${secs}s`;
//   } else if (minutes > 0) {
//     return `${minutes}m ${secs}s`;
//   } else {
//     return `${secs}s`;
//   }
// };

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
import {
  db
} from "../firebase";

/**
 * Log user login - એક દિવસમાં એક જ ID (કોઈ પણ system/browser)
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
    
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log("🔍 Checking for existing entry on date:", dateString);
    console.log("🔍 User ID:", userId);

    // ✅ Query to find today's entry for this user
    const userEntriesQuery = query(
      loginLogRef,
      where("userId", "==", userId),
      where("date", "==", dateString)
    );

    const snapshot = await getDocs(userEntriesQuery);
    
    // ✅ If ANY entry exists for today, use it
    if (!snapshot.empty) {
      // Use the FIRST document found
      const existingDoc = snapshot.docs[0];
      const existingLogId = existingDoc.id;
      const existingData = existingDoc.data();
      
      console.log("♻️ Found existing entry:", existingLogId);
      console.log("   Current status:", existingData.status);
      console.log("   Login time:", existingData.loginTime?.toDate());
      console.log("   Logout time:", existingData.logoutTime?.toDate());
      
      // 🔧 Always reactivate - clear logout time
      await updateDoc(doc(db, "loginLogs", existingLogId), {
        logoutTime: null,
        sessionDuration: null,
        status: "active",
        updatedAt: serverTimestamp(),
      });
      console.log("✅ Reactivated - logout cleared, status active");

      localStorage.setItem("currentLoginLogId", existingLogId);
      
      console.log("✅ Using existing entry from today!");
      console.log("✅ Log ID:", existingLogId);
      
      scheduleAutoLogout(existingLogId);
      
      return existingLogId;
    }

    // ✅ No entry exists for today - create new one
    console.log("📝 Creating NEW entry for today:", dateString);
    
    const loginData = {
      userId,
      email,
      role,
      department,
      userName,
      loginTime: serverTimestamp(),
      logoutTime: null,
      sessionDuration: null,
      status: "active",
      date: dateString,
      ipAddress: null,
      browser: navigator.userAgent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(loginLogRef, loginData);
    localStorage.setItem("currentLoginLogId", docRef.id);
    console.log("✅ First login of the day - new entry created:", docRef.id);
    
    scheduleAutoLogout(docRef.id);
    
    return docRef.id;
    
  } catch (error) {
    console.error("❌ Error logging login:", error);
    throw error;
  }
};

/**
 * Log user logout
 */
export const logUserLogout = async (logId = null) => {
  try {
    // Get log ID from parameter or localStorage
    const loginLogId = logId || localStorage.getItem("currentLoginLogId");

    if (!loginLogId) {
      console.warn("⚠️ No active login session found to log logout");
      return;
    }

    const loginLogRef = doc(db, "loginLogs", loginLogId);
    const now = Timestamp.now();

    console.log("🚪 Logging logout for ID:", loginLogId);

    // Update the login log with logout time
    await updateDoc(loginLogRef, {
      logoutTime: now,
      status: "completed",
      updatedAt: serverTimestamp(),
    });

    // 🔧 localStorage keep કરો (આવતી વાર reactivate માટે)
    // localStorage.removeItem("currentLoginLogId"); // આ comment out!

    // 🆕 Auto-logout scheduler clear કરો
    clearAutoLogoutScheduler();

    console.log("✅ Logout logged successfully:", loginLogId);
    console.log("   Logout time set to:", now.toDate());
  } catch (error) {
    console.error("❌ Error logging logout:", error);
    // Don't throw error to prevent blocking logout process
  }
};

/**
 * 🆕 Auto-logout scheduler - 8:00 PM સુધી wait કરે, પછી auto-logout
 * Login થતાં જ start થાય છે
 */
let autoLogoutTimer = null;

const scheduleAutoLogout = (logId) => {
  // પહેલાંની timer clear કરો
  clearAutoLogoutScheduler();
  
  const now = new Date();
  const targetTime = new Date();
  
  // 🕐 Target time set કરો - 8:00 PM (20:00)
  targetTime.setHours(20, 0, 0, 0);
  
  // જો 8 PM પસાર થઈ ગયો હોય તો આવતી કાલે
  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  const timeUntilLogout = targetTime - now;
  
  console.log("⏰ Auto-logout scheduled for:", targetTime.toLocaleString());
  console.log("   Time remaining:", Math.floor(timeUntilLogout / 1000 / 60), "minutes");
  
  // Timer set કરો
  autoLogoutTimer = setTimeout(async () => {
    console.log("🕐 Auto-logout time reached (8:00 PM)");
    
    try {
      const loginLogRef = doc(db, "loginLogs", logId);
      const now = Timestamp.now();
      
      await updateDoc(loginLogRef, {
        logoutTime: now,
        status: "auto-completed",
        updatedAt: serverTimestamp(),
      });
      
      console.log("✅ Auto-logout completed at 8:00 PM");
      console.log("   Status: auto-completed");
    } catch (error) {
      console.error("❌ Auto-logout failed:", error);
    }
  }, timeUntilLogout);
};

const clearAutoLogoutScheduler = () => {
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
    console.log("⏰ Auto-logout scheduler cleared");
  }
};

/**
 * 🆕 Manual auto-logout - Admin use માટે (inactive sessions clear કરવા)
 * કોઈ પણ active sessions જે 24 કલાક જૂની હોય તે auto-complete કરે
 */
export const autoLogoutInactiveSessions = async (maxHours = 24) => {
  try {
    const q = query(
      collection(db, "loginLogs"),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);
    const now = new Date();
    let autoLoggedOut = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const loginTime = data.loginTime?.toDate();
      
      if (loginTime) {
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursSinceLogin > maxHours) {
          await updateDoc(doc(db, "loginLogs", docSnap.id), {
            status: "auto-completed",
            logoutTime: Timestamp.fromDate(new Date(loginTime.getTime() + maxHours * 60 * 60 * 1000)),
            updatedAt: serverTimestamp(),
          });
          autoLoggedOut++;
        }
      }
    }

    console.log(`✅ Auto-logged out ${autoLoggedOut} inactive sessions`);
    return autoLoggedOut;
  } catch (error) {
    console.error("❌ Error auto-logging out sessions:", error);
    throw error;
  }
};

/**
 * Get all login logs with optional filters
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
        loginTime: data.loginTime ? data.loginTime.toDate() : null,
        logoutTime: data.logoutTime ? data.logoutTime.toDate() : null,
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
        loginTime: data.loginTime ? data.loginTime.toDate() : null,
        logoutTime: data.logoutTime ? data.logoutTime.toDate() : null,
      });
    });

    return logs;
  } catch (error) {
    console.error("Error fetching user login logs:", error);
    throw error;
  }
};

/**
 * Get all currently active sessions
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
        loginTime: data.loginTime ? data.loginTime.toDate() : null,
      });
    });

    return activeSessions;
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    throw error;
  }
};

/**
 * Format session duration in human-readable format
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

// Export clearAutoLogoutScheduler if needed in App.jsx
export { clearAutoLogoutScheduler };