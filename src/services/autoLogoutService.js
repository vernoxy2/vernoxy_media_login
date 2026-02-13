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
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 20) {
      console.log("⏰ Not yet 8 PM, skipping auto-logout");
      return;
    }

    console.log("✅ It's past 8 PM, proceeding with auto-logout...");

    const loginLogsRef = collection(db, "loginLogs");
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

    // Set logout time to 8:00 PM of today
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
      const logRef = doc(db, "loginLogs", docSnap.id);
      await updateDoc(logRef, {
        logoutTime: logoutTimestamp,
        status: "auto-completed",
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Auto-logged out user: ${docSnap.data().userName}`);
    });

    await Promise.all(updatePromises);
    console.log(`✅ Auto-logout completed for ${snapshot.docs.length} users`);

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