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
  Timestamp,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  db
} from "../firebase";

const generateSessionId = () =>
  `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
const formatDateTimeString = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);

export const logUserLogin = async (userId, email, role, department = "", userName = "") => {
  try {
    const loginLogRef = collection(db, "loginLogs");
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const sessionId = generateSessionId();
    const now = Timestamp.now();

    const newLoginEntry = {
      type: "login",
      sessionId,
      timestamp: now,
      dateTime: formatDateTimeString(now.toDate()),
    };

    // const todayQuery = query(
    //   loginLogRef,
    //   where("userId", "==", userId),
    //   where("date", "==", dateString)
    // );
    // const snapshot = await getDocs(todayQuery);

    // if (!snapshot.empty) {
    //   const existingDoc   = snapshot.docs[0];
    //   const existingLogId = existingDoc.id;

    //   console.log("♻️ Re-login — reusing doc:", existingLogId);

    //   await updateDoc(doc(db, "loginLogs", existingLogId), {
    //     status: "active",
    //     logoutTime: null,       // Clear previous logout on re-login
    //     updatedAt: serverTimestamp(),
    //     currentSessionId: sessionId,
    //     timeLog: arrayUnion(newLoginEntry),
    //   });

    //   localStorage.setItem("currentLoginLogId", existingLogId);
    //   localStorage.setItem("currentSessionId", sessionId);
    //   return existingLogId;
    // }


    // todays activity
    const todayQuery = query(
      loginLogRef,
      where("userId", "==", userId),
      where("date", "==", dateString)
    );
    const todaySnapshot = await getDocs(todayQuery);

    if (!todaySnapshot.empty) {
      const existingDoc = todaySnapshot.docs[0];
      const existingLogId = existingDoc.id;

      await updateDoc(doc(db, "loginLogs", existingLogId), {
        status: "active",
        logoutTime: null,
        updatedAt: serverTimestamp(),
        currentSessionId: sessionId,
        timeLog: arrayUnion(newLoginEntry),
      });

      localStorage.setItem("currentLoginLogId", existingLogId);
      localStorage.setItem("currentSessionId", sessionId);
      return existingLogId;
    }

    // yesterdays activity
    const prevActiveQuery = query(
      loginLogRef,
      where("userId", "==", userId),
      where("status", "==", "active"),
      orderBy("loginTime", "desc"),
      limit(1)
    );
    const prevActiveSnapshot = await getDocs(prevActiveQuery);

    if (!prevActiveSnapshot.empty) {
      const prevDoc = prevActiveSnapshot.docs[0];
      const prevDocId = prevDoc.id;
      const prevData = prevDoc.data();

      if (prevData.date !== dateString) {
        let sessionDuration = null;
        if (prevData.loginTime) {
          sessionDuration = Math.floor(
            (now.toDate() - prevData.loginTime.toDate()) / 1000
          );
        }

        const forgotLogoutEntry = {
          type: "logout",
          sessionId: prevData.currentSessionId || "unknown",
          timestamp: now,
          dateTime: formatDateTimeString(now.toDate()),
          sessionDuration,
          note: "auto-closed: user forgot to logout",
        };

        await updateDoc(doc(db, "loginLogs", prevDocId), {
          logoutTime: now,
          status: "completed",
          sessionDuration,
          updatedAt: serverTimestamp(),
          timeLog: arrayUnion(forgotLogoutEntry),
        });
      }
    }
    // First login of the day
    const loginData = {
      userId,
      email,
      role,
      department,
      userName: userName || email,
      date: dateString,
      loginTime: now,
      logoutTime: null,
      status: "active",
      currentSessionId: sessionId,
      sessionDuration: null,
      ipAddress: null,
      browser: navigator.userAgent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeLog: [newLoginEntry],
    };

    const docRef = await addDoc(loginLogRef, loginData);
    localStorage.setItem("currentLoginLogId", docRef.id);
    localStorage.setItem("currentSessionId", sessionId);

    console.log("✅ First login of the day:", docRef.id);
    return docRef.id;

  } catch (error) {
    console.error("❌ Error logging login:", error);
    throw error;
  }
};

export const logUserLogout = async (logId = null) => {
  try {
    const loginLogId = logId || localStorage.getItem("currentLoginLogId");
    const sessionId = localStorage.getItem("currentSessionId");

    if (!loginLogId) {
      console.warn("⚠️ No active login session found");
      return;
    }

    const loginLogRef = doc(db, "loginLogs", loginLogId);
    const logDoc = await getDoc(loginLogRef);
    const now = Timestamp.now();

    let sessionDuration = null;

    if (logDoc.exists()) {
      const timeLog = logDoc.data().timeLog || [];
      const lastLogin = [...timeLog]
        .reverse()
        .find(e => e.type === "login" && e.sessionId === sessionId);

      if (lastLogin ?.timestamp) {
        sessionDuration = Math.floor(
          (now.toDate() - lastLogin.timestamp.toDate()) / 1000
        );
      }
    }

    const logoutEntry = {
      type: "logout",
      sessionId,
      timestamp: now,
      dateTime: formatDateTimeString(now.toDate()),
      sessionDuration,
    };

    await updateDoc(loginLogRef, {
      logoutTime: now, // Last logout time
      status: "completed",
      updatedAt: serverTimestamp(),
      timeLog: arrayUnion(logoutEntry),
    });

    localStorage.removeItem("currentLoginLogId");
    localStorage.removeItem("currentSessionId");

    console.log("✅ Logout logged:", loginLogId);

  } catch (error) {
    console.error("❌ Error logging logout:", error);
  }
};
export const getLoginLogs = async (filters = {}) => {
  try {
    let q = query(collection(db, "loginLogs"), orderBy("loginTime", "desc"));
    if (filters.userId) q = query(q, where("userId", "==", filters.userId));
    if (filters.role) q = query(q, where("role", "==", filters.role));
    if (filters.limitCount) q = query(q, limit(filters.limitCount));

    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let sessionDuration = null;
      if (data.loginTime && data.logoutTime) {
        sessionDuration = Math.floor(
          (data.logoutTime.toDate() - data.loginTime.toDate()) / 1000
        );
      }
      logs.push({
        id: docSnap.id,
        ...data,
        sessionDuration,
        loginTime: data.loginTime ? data.loginTime.toDate() : null,
        logoutTime: data.logoutTime ? data.logoutTime.toDate() : null,
        timeLog: (data.timeLog || []).map(e => ({
          ...e,
          timestamp: e.timestamp?.toDate ? e.timestamp.toDate() : e.timestamp,

        })),
      });
    });

    return logs;
  } catch (error) {
    console.error("Error fetching login logs:", error);
    throw error;
  }
};
export const getLoginLogById = async (logId) => {
  try {
    const docSnap = await getDoc(doc(db, "loginLogs", logId));
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      loginTime: data.loginTime ? data.loginTime.toDate() : null,
      logoutTime: data.logoutTime ? data.logoutTime.toDate() : null,
      timeLog: (data.timeLog || [])
        .map(e => ({
          ...e,
          timestamp: e.timestamp?.toDate ? e.timestamp.toDate() : e.timestamp,
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    };
  } catch (error) {
    console.error("Error fetching log by id:", error);
    throw error;
  }
};
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
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      logs.push({
        id: docSnap.id,
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
export const getActiveSessions = async () => {
  try {
    const q = query(
      collection(db, "loginLogs"),
      where("status", "==", "active"),
      orderBy("loginTime", "desc")
    );
    const querySnapshot = await getDocs(q);
    const activeSessions = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      activeSessions.push({
        id: docSnap.id,
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
export const formatSessionDuration = (seconds) => {
  if (!seconds) return "N/A";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};
export const clearAutoLogoutScheduler = () => {};