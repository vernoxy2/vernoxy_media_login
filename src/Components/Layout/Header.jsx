import React, { useState, useEffect, useRef } from "react";
import { BsPersonFill } from "react-icons/bs";
import { IoMdNotifications } from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase";

const Header = ({ toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Get user info from localStorage
  const [userEmail] = useState(
    () => localStorage.getItem("userEmail") || "User"
  );
  
  // ✅ NEW: Get user role (Admin or User)
  const [userRole] = useState(
    () => localStorage.getItem("userDisplayRole") || localStorage.getItem("userRole") || "User"
  );

  useEffect(() => {
    // Listen to all material requests in real-time
    const q = query(
      collection(db, "materialRequest"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifications = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allNotifications.push({
          id: doc.id,
          ...data,
        });
      });

      // Filter only unread notifications
      const unreadNotifications = allNotifications.filter(
        (notification) => notification.notificationRead !== true
      );

      setUnreadCount(unreadNotifications.length);
    });

    return () => unsubscribe();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ FIXED: Proper logout with Firebase signout
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userDisplayRole");
      
      // Navigate to login page
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if Firebase signout fails, clear localStorage and navigate
      localStorage.clear();
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <header className="bg-white shadow flex items-center justify-between px-4 md:pr-16 relative z-10 py-2">
      {/* Mobile Menu Icon */}
      <div className="flex items-center gap-2">
        <IoMenu
          className="text-4xl md:hidden text-primary z-10"
          aria-label="Menu"
          onClick={toggleMobileSidebar}
        />
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-2 max-w-full z-10">
          {/* Add your logo here */}
        </Link>
      </div>

      {/* Divider */}
      <hr className="hidden lg:block w-px" />

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 md:space-x-5 z-10">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            aria-label="Notifications"
            className="bg-[#3668B1] rounded-full text-white w-10 md:w-12 h-10 md:h-12 flex items-center justify-center relative hover:bg-[#2a5492] transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <IoMdNotifications className="md:text-2xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User Menu"
            className="bg-[#3668B1] rounded-full text-white w-10 md:w-12 h-10 md:h-12 flex items-center justify-center hover:bg-[#2a5492] transition-colors"
          >
            <BsPersonFill className="md:text-2xl" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-66 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm text-gray-500">Signed in as</p>
                {/* ✅ FIXED: Show role (Admin/User) instead of just "User" */}
                <p className="text-sm font-semibold text-[#3668B1]">
                  {userRole}
                </p>
                <p className="text-xs text-gray-600 truncate mt-1">
                  {userEmail}
                </p>
              </div>

              {/* Logout Section */}
              <div className="border-t border-gray-200 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <BiLogOut className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;