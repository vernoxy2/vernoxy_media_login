// src/components/TestNotifications.jsx
// Create this NEW file

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const TestNotifications = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const testNotificationSetup = async () => {
      try {
        if (!userId) {
          console.error("❌ No userId found in localStorage");
          setDebugInfo({ error: "No userId found" });
          return;
        }
        const notificationsRef = collection(db, "notifications");
        const q = query(notificationsRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const notifications = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notifications.push({ id: doc.id, ...data });
        });

        setDebugInfo({
          success: true,
          userId,
          notificationCount: snapshot.size,
          notifications: notifications,
          firebaseConnected: true
        });

      } catch (error) {
        console.error("❌ Test failed:", error);
        setDebugInfo({
          error: error.message,
          errorCode: error.code,
          userId
        });
      }
    };

    testNotificationSetup();
  }, [userId]);

  // return (
  //   <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md z-50">
  //     <h3 className="font-bold mb-2">🧪 Notification Debug Info</h3>
  //     <pre className="text-xs overflow-auto max-h-96">
  //       {JSON.stringify(debugInfo, null, 2)}
  //     </pre>
  //   </div>
  // );
};