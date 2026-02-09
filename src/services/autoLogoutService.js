// src/services/autoLogoutService.js
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import {
  db
} from "../firebase";

/**
 * Auto-logout check: Runs after 7:00 PM
 * Sets logout time as: 7:00 PM
 * Only for users who forgot to logout (logoutTime is NULL)
 */
export const autoLogoutAfter7PM = async () => {
  try {
    console.log("🔄 Checking for users who forgot to logout...");

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

    // Query: Find today's records where logoutTime is NULL
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

    // Create 7:00 PM timestamp for logout time
    const now = new Date();
    const logout7PM = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      19, 
      0,
      0,
      0
    );

    const logoutTimestamp = Timestamp.fromDate(logout7PM);

    console.log(`⚠️ Found ${snapshot.size} users who forgot to logout`);

    // Update all records with NULL logout time
    const updatePromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const logRef = doc(db, "loginLogs", docSnap.id);

      await updateDoc(logRef, {
        logoutTime: logoutTimestamp,
        status: "auto-completed",
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Set 7 PM logout for: ${data.userName || data.email}`);
    });

    await Promise.all(updatePromises);

    console.log(`🎉 Auto-logout completed for ${snapshot.size} users`);

  } catch (error) {
    console.error("❌ Auto-logout error:", error);
  }
};

/**
 * Schedule auto-logout to run daily at 7:05 PM
 * This ensures the check happens after work hours (9 AM - 6 PM)
 */
export const scheduleAutoLogout = () => {
  const now = new Date();

  // Set target time to 7:05 PM today
  const target705PM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    19, // 7 PM
    5, // 5 minutes
    0,
    0
  );

  // If it's already past 7:05 PM, schedule for tomorrow
  if (now > target705PM) {
    target705PM.setDate(target705PM.getDate() + 1);
  }

  const timeUntil = target705PM - now;
  const minutesLeft = Math.floor(timeUntil / 1000 / 60);

  console.log(`⏰ Auto-logout will run in ${minutesLeft} minutes (at 7:05 PM)`);
  console.log(`📌 Users who forgot to logout will have 7:00 PM set as logout time`);

  setTimeout(() => {
    autoLogoutAfter7PM();
    // Reschedule for next day
    scheduleAutoLogout();
  }, timeUntil);
};