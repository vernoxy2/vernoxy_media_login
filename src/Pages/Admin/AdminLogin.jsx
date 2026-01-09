// src/Pages/Admin/AdminLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { LogIn, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          // Both admin and user go to /admin
          navigate("/admin", { replace: true });
        }
      }
    };
    checkAuth();
  }, [navigate]);

  // ✅ FIXED: Changed navigation from /admin/login to /admin
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        setError("User profile not found");
        await auth.signOut();
        setLoading(false);
        return;
      }

      const userData = userDoc.data();

      // Both admin and user go to /admin
      if (userData.role === "admin" || userData.role === "user") {
        // Save user data to localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", userData.role); // "admin" or "user"
        localStorage.setItem("userEmail", userData.email || email);
        localStorage.setItem("userId", user.uid);
        
        // Display role with capital first letter
        const displayRole = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
        localStorage.setItem("userDisplayRole", displayRole); // "Admin" or "User"
        
        // ✅ FIXED: Navigate to /admin instead of /admin/login
        navigate("/admin", { replace: true });
      } else {
        setError("Access denied. Admin privileges required.");
        await auth.signOut();
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }

      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setResetError("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      const emailToCheck = resetEmail.trim().toLowerCase();

      // Check if email exists in Firestore users collection
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailToCheck), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setResetError(
          "This email is not registered in our system. Please check your email or contact admin."
        );
        setLoading(false);
        return;
      }

      // Email exists, send password reset email
      await sendPasswordResetEmail(auth, emailToCheck);

      setResetMessage(
        "Password reset email sent successfully! Check your inbox and spam folder."
      );
      setResetEmail("");

      // Auto close after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage("");
      }, 3000);
    } catch (error) {
      console.error("Password Reset Error:", error);

      if (error.code === "auth/user-not-found") {
        setResetError(
          "Email found in database but not in authentication system. Please contact admin."
        );
      } else if (error.code === "auth/invalid-email") {
        setResetError("Invalid email address format");
      } else if (error.code === "auth/too-many-requests") {
        setResetError(
          "Too many reset attempts. Please try again after some time."
        );
      } else if (error.code === "auth/missing-email") {
        setResetError("Please enter an email address");
      } else if (
        error.code === "permission-denied" ||
        error.message?.includes("permission")
      ) {
        setResetError(
          "Database access error. Please contact admin to update security rules."
        );
      } else {
        setResetError(
          "Failed to send reset email. Please try again or contact admin."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/50">
                <LogIn className="w-10 h-10 text-black" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-Bai_Jamjuree">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="reset-email" className="sr-only">
                Email address
              </label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={loading}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Email address"
              />
            </div>

            {resetError && (
              <div className="rounded-md bg-red-500/20 border border-red-500 p-4">
                <p className="text-sm text-red-400 whitespace-pre-wrap">
                  {resetError}
                </p>
              </div>
            )}

            {resetMessage && (
              <div className="rounded-md bg-green-500/20 border border-green-500 p-4">
                <p className="text-sm text-green-400">{resetMessage}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 shadow-lg shadow-primary/30 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                  setResetError("");
                  setResetMessage("");
                }}
                disabled={loading}
                className="flex justify-center items-center gap-2 py-3 px-4 border border-gray-700 text-sm font-medium rounded-lg text-white bg-gray-800/50 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Remember your password?{" "}
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/50">
              <LogIn className="w-10 h-10 text-black" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-Bai_Jamjuree">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Access the ERP submissions dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all duration-300"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <input
                key={showPassword ? "text" : "password"}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-500/20 border border-red-500 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 shadow-lg shadow-primary/30 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            For admin access only. Contact support if you need help.
          </p>
        </div>
      </div>
    </div>
  );
}