// // src/firebase.js
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// // Your Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDUJY3MJuYmDwriz_VtF4fkjcGhBQcX78M",
//   authDomain: "vernoxy-media.firebaseapp.com",
//   projectId: "vernoxy-media",
//   storageBucket: "vernoxy-media.firebasestorage.app",
//   messagingSenderId: "29003109920",
//   appId: "1:29003109920:web:f3115a221f201a04434e45",
//   measurementId: "G-8PKSEKJVM5"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Authentication and get a reference to the service
// export const auth = getAuth(app);

// // Initialize Cloud Firestore and get a reference to the service
// export const db = getFirestore(app);

// export default app;
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUJY3MJuYmDwriz_VtF4fkjcGhBQcX78M",
  authDomain: "vernoxy-media.firebaseapp.com",
  projectId: "vernoxy-media",
  storageBucket: "vernoxy-media.firebasestorage.app",
  messagingSenderId: "29003109920",
  appId: "1:29003109920:web:f3115a221f201a04434e45",
  measurementId: "G-8PKSEKJVM5"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  console.log("🔥 Initializing Firebase...");
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase App initialized");

  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized");

  db = getFirestore(app);
  console.log("✅ Firestore initialized");

} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  console.error("Error code:", error.code);
  console.error("Error message:", error.message);
}

// Test connection
if (db) {
  import("firebase/firestore").then(({ collection, getDocs, query, limit }) => {
    const testConnection = async () => {
      try {
        console.log("🔍 Testing Firestore connection...");
        const testRef = collection(db, "projects");
        const snapshot = await getDocs(query(testRef, limit(1)));
        console.log("✅ Firestore OK! Found", snapshot.size, "documents");
      } catch (error) {
        console.error("❌ Firestore test failed:", error.code, error.message);
      }
    };
    
    if (document.readyState === "complete") {
      testConnection();
    } else {
      window.addEventListener("load", testConnection);
    }
  });
}

export { auth, db };
export default app;