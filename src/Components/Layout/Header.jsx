import React, { useState, useEffect, useRef } from "react";
import { BsPersonFill } from "react-icons/bs";
import { IoMdNotifications } from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import { Clock, Play, Pause, Square } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useTimer } from "../../context/TimerContext";
import PauseReasonModal from "../PauseReasonModal";

const Header = ({ toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const {
    activeTimer,
    remainingSeconds,
    isRunning,
    pauseTimer,
    resumeTimer,
    stopTimer,
    formatTime,
    getProgressPercentage
  } = useTimer();

  const [userEmail] = useState(
    () => localStorage.getItem("userEmail") || "User"
  );
  
  const [userRole] = useState(
    () => localStorage.getItem("userDisplayRole") || localStorage.getItem("userRole") || "User"
  );

  useEffect(() => {
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

      const unreadNotifications = allNotifications.filter(
        (notification) => notification.notificationRead !== true
      );

      setUnreadCount(unreadNotifications.length);
    });

    return () => unsubscribe();
  }, []);

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
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/admin/login", { replace: true });
    }
  };

  const handlePauseClick = () => {
    setShowPauseModal(true);
  };

  const handlePauseConfirm = async (reason) => {
    await pauseTimer(reason);
    setShowPauseModal(false);
  };

  // const handleStopTimer = async () => {
  //   if (window.confirm('Are you sure you want to stop this timer? This will end the project tracking.')) {
  //     await stopTimer();
  //   }
  // };

  return (
    <>
      <header className="bg-white shadow flex items-center justify-between px-4 md:pr-16 relative z-10 py-2">
        {/* Mobile Menu Icon */}
        <div className="flex items-center gap-2">
          <IoMenu
            className="text-4xl md:hidden text-primary z-10"
            aria-label="Menu"
            onClick={toggleMobileSidebar}
          />
          <Link to="/" className="flex items-center space-x-2 max-w-full z-10">
            {/* Add your logo here */}
          </Link>
        </div>

        {/* Timer Display - Center */}
        {activeTimer && (
          <div className="flex-1 flex justify-center px-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 shadow-lg max-w-md w-full">
              <div className="flex items-center justify-between gap-3">
                {/* Timer Info */}
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-5 h-5 text-white" />
                  <div className="flex-1">
                    <div className="text-white text-xl font-bold font-mono">
                      {formatTime(remainingSeconds)}
                    </div>
                    <div className="text-indigo-100 text-xs truncate">
                      {activeTimer.clientName} - {activeTimer.projectId}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden sm:block flex-1 max-w-[100px]">
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-1000 ease-linear"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <div className="text-white text-[10px] text-center mt-0.5">
                    {Math.round(getProgressPercentage())}%
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={isRunning ? handlePauseClick : resumeTimer}
                    disabled={remainingSeconds === 0}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isRunning ? "Pause Timer" : "Resume Timer"}
                  >
                    {isRunning ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  {/* <button
                    type="button"
                    onClick={handleStopTimer}
                    className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-md transition-colors"
                    title="Stop Timer"
                  >
                    <Square className="w-4 h-4" />
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        )}

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

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-66 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="text-sm font-semibold text-[#3668B1]">
                    {userRole}
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-1">
                    {userEmail}
                  </p>
                </div>

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

      {/* Pause Reason Modal */}
      <PauseReasonModal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        onConfirm={handlePauseConfirm}
      />
    </>
  );
};

export default Header;