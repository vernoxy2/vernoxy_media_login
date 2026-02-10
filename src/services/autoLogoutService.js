// src/services/autoLogoutService.js
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  db
} from "../firebase";

export const autoLogoutAfter8PM = async () => {
  try {
    const loginLogsRef = collection(db, "loginLogs");

    // Get today's date starting from 00:00:00
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const todayStart = Timestamp.fromDate(today);

    // // Query: Find today's records where logoutTime is NULL
    // const notLoggedOutQuery = query(
    //   loginLogsRef,
    //   where("loginTime", ">=", todayStart),
    //   where("logoutTime", "==", null)
    // );
   
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; 
    const notLoggedOutQuery = query(
      loginLogsRef,
      where("date", "==", dateString),
      where("logoutTime", "==", null)
    );

    const snapshot = await getDocs(notLoggedOutQuery);
    if (snapshot.empty) {
      console.log("✅ All users logged out properly!");
      return;
    }
    const now = new Date();
    const logout8PM = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      20, 
      0,
      0,
      0
    );
    const logoutTimestamp = Timestamp.fromDate(logout8PM);
    const updatePromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const logRef = doc(db, "loginLogs", docSnap.id);
      await updateDoc(logRef, {
        logoutTime: logoutTimestamp,
        status: "auto-completed",
        updatedAt: Timestamp.now()
      });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("❌ Auto-logout error:", error);
  }
};

export const scheduleAutoLogout = () => {
  const now = new Date();
  const target805PM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    20, 
    5, 
    0,
    0
  );
  if (now > target805PM) {
    target805PM.setDate(target805PM.getDate() + 1);
  }

  const timeUntil = target805PM - now;
  const minutesLeft = Math.floor(timeUntil / 1000 / 60);

  setTimeout(() => {
    autoLogoutAfter8PM();
    scheduleAutoLogout();
  }, timeUntil);
};