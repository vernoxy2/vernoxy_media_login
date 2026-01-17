import React, { useState, useEffect, useRef } from "react";
import { BsPersonFill } from "react-icons/bs";
import { IoMdNotifications } from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ✅ useLocation added
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Clock, Play, Pause, X } from "lucide-react";

// ✅ COUNTDOWN TIMER COMPONENT
const CountdownTimer = ({ onClose }) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [projectId, setProjectId] = useState("");

  // ✅ LOAD TIMER ON MOUNT
  useEffect(() => {
    const loadTimer = () => {
      const timerData = localStorage.getItem("activeTimer");
      if (timerData) {
        try {
          const { projectId, estimatedHours, estimatedMinutes, startTime } =
            JSON.parse(timerData);
          const hours = parseInt(estimatedHours) || 0;
          const minutes = parseInt(estimatedMinutes) || 0;
          const total = hours * 3600 + minutes * 60;

          // Calculate elapsed time since timer started
          const elapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
          const remaining = Math.max(0, total - elapsed);

          setProjectId(projectId);
          setTotalSeconds(total);
          setRemainingSeconds(remaining);
          setIsRunning(remaining > 0);
        } catch (error) {
          console.error("Error loading timer:", error);
          localStorage.removeItem("activeTimer");
        }
      }
    };

    loadTimer();

    // ✅ LISTEN FOR NEW TIMER START
    const handleTimerStart = (event) => {
      const { estimatedHours, estimatedMinutes } = event.detail;
      const hours = parseInt(estimatedHours) || 0;
      const minutes = parseInt(estimatedMinutes) || 0;
      const total = hours * 3600 + minutes * 60;

      setTotalSeconds(total);
      setRemainingSeconds(total);
      setIsRunning(true);
    };

    window.addEventListener("timerStart", handleTimerStart);
    return () => window.removeEventListener("timerStart", handleTimerStart);
  }, []);

  // ✅ COUNTDOWN LOGIC - DECREASES EVERY SECOND
  useEffect(() => {
    let interval;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          const newValue = prev - 1;

          // ✅ TIMER COMPLETED
          if (newValue <= 0) {
            setIsRunning(false);
            localStorage.removeItem("activeTimer");

            // Show browser notification
            if (window.Notification && Notification.permission === "granted") {
              new Notification("Timer Complete!", {
                body: `Project ${projectId} time is up!`,
              });
            }

            return 0;
          }

          return newValue;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds, projectId]);

  // ✅ FORMAT TIME AS HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  // ✅ CALCULATE PROGRESS PERCENTAGE
  const getProgressPercentage = () => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  };

  // ✅ GET TIME COLOR BASED ON REMAINING TIME
  const getTimeColor = () => {
    const percentage = (remainingSeconds / totalSeconds) * 100;
    if (percentage <= 10) return "text-red-100 animate-pulse";
    if (percentage <= 25) return "text-orange-100";
    return "text-white";
  };

  // ✅ GET BACKGROUND COLOR BASED ON REMAINING TIME
  const getBackgroundGradient = () => {
    if (remainingSeconds === 0) return "from-red-500 to-red-700";
    const percentage = (remainingSeconds / totalSeconds) * 100;
    if (percentage <= 10) return "from-orange-500 to-red-600";
    return "from-indigo-500 to-purple-600";
  };

  // ✅ TOGGLE PLAY/PAUSE
  const handleToggle = () => {
    if (isRunning) {
      setIsRunning(false);
    } else if (remainingSeconds > 0) {
      setIsRunning(true);
    }
  };

  // ✅ CLOSE TIMER WITH CONFIRMATION
  const handleClose = () => {
    if (window.confirm("Are you sure you want to stop the timer?")) {
      localStorage.removeItem("activeTimer");
      if (onClose) onClose();
    }
  };

  // ✅ DON'T SHOW IF NO TIMER
  if (totalSeconds === 0) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r ${getBackgroundGradient()} rounded-lg p-2 md:p-3 shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center justify-between gap-2 md:gap-3">
        {/* LEFT: TIMER DISPLAY */}
        <div className="flex items-center gap-2">
          <Clock
            className={`w-4 h-4 md:w-5 md:h-5 text-white ${
              remainingSeconds < totalSeconds * 0.1 ? "animate-pulse" : ""
            }`}
          />
          <div>
            {/* COUNTDOWN TIME */}
            <div
              className={`text-lg md:text-xl font-bold font-mono ${getTimeColor()}`}
            >
              {formatTime(remainingSeconds)}
            </div>
            {/* STATUS */}
            <div className="text-indigo-100 text-[10px] md:text-xs font-medium">
              {/* {remainingSeconds === 0 ? "⏰ Time's up!" : isRunning ? "🔥 Running" : "⏸️ Paused"} */}
            </div>
          </div>
        </div>

        {/* CENTER: PROGRESS BAR - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-[120px] lg:max-w-[180px] flex-col">
          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                remainingSeconds < totalSeconds * 0.1
                  ? "bg-red-300"
                  : "bg-white"
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="text-white text-xs text-center mt-1 font-medium">
            {Math.round(getProgressPercentage())}%
          </div>
        </div>

        {/* RIGHT: CONTROLS */}
        <div className="flex gap-1 md:gap-2">
          {/* PLAY/PAUSE BUTTON */}
          <button
            onClick={handleToggle}
            disabled={remainingSeconds === 0}
            className="p-1.5 md:p-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isRunning ? "Pause Timer" : "Resume Timer"}
          >
            {isRunning ? (
              <Pause className="w-3 h-3 md:w-4 md:h-4" />
            ) : (
              <Play className="w-3 h-3 md:w-4 md:h-4" />
            )}
          </button>

          {/* CLOSE BUTTON */}
          <button
            onClick={handleClose}
            className="p-1.5 md:p-2 bg-white/20 hover:bg-red-500/70 text-white rounded-md transition-colors"
            title="Stop Timer"
          >
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ MAIN HEADER COMPONENT
const Header = ({ toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ ADDED - Track current route
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Get user info from localStorage
  const [userEmail] = useState(
    () => localStorage.getItem("userEmail") || "User"
  );

  const [userRole] = useState(
    () =>
      localStorage.getItem("userDisplayRole") ||
      localStorage.getItem("userRole") ||
      "User"
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

  // ✅ UPDATED - CHECK FOR ACTIVE TIMER AND CURRENT ROUTE
  useEffect(() => {
    const timerData = localStorage.getItem("activeTimer");
    
    // ✅ ONLY SHOW TIMER ON PROJECT DETAIL PAGE (/admin/projects/:id)
    const isProjectDetailPage = /^\/admin\/projects\/[^\/]+$/.test(location.pathname);
    
    setShowTimer(!!timerData && isProjectDetailPage);

    // Listen for timer start events
    const handleTimerStart = () => {
      // Only show if we're on project detail page
      if (isProjectDetailPage) {
        setShowTimer(true);
      }
    };

    window.addEventListener("timerStart", handleTimerStart);

    // Request notification permission
    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => window.removeEventListener("timerStart", handleTimerStart);
  }, [location.pathname]); // ✅ RE-RUN WHEN ROUTE CHANGES

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

  const handleLogout = async () => {
    try {
      await auth.signOut();

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userDisplayRole");
      localStorage.removeItem("activeTimer");

      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
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

      {/* ✅ COUNTDOWN TIMER - ONLY SHOWS ON PROJECT DETAIL PAGE */}
      <div className="flex-1 flex justify-center px-2 md:px-4">
        {showTimer && <CountdownTimer onClose={() => setShowTimer(false)} />}
      </div>

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