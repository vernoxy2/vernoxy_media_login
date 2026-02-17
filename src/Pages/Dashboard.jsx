import React, { useState, useEffect } from "react";
import { useProjects } from "../context/ProjectContext";
import { StatCard } from "../Components/dashboard/StatCard";
import { StatusBreakdown } from "../Components/dashboard/StatusBreakdown";
import { ServiceBreakdown } from "../Components/dashboard/ServiceBreakdown";
import { RecentProjects } from "../Components/dashboard/RecentProjects";
import { FolderKanban, Users, Clock, CheckCircle2 } from "lucide-react";
import Headerr from "../Components/Layout/Headerr";
import Footer from "../Components/Layout/Footer";
import { LogIn, LogOut } from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";

export default function Dashboard() {
  const { projects, teamMembers, currentUser } = useProjects();
  const [todayLog, setTodayLog] = useState(null);
  const [isLoadingLog, setIsLoadingLog] = useState(true);
  
  const fmtTime = (date) => {
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  // Function to save login time
  const saveLoginTime = async (userId) => {
    try {
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      
      const q = query(
        collection(db, "loginLogs"),
        where("userId", "==", userId),
        where("date", "==", dateString)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Create new login log
        const docRef = doc(collection(db, "loginLogs"));
        await setDoc(docRef, {
          userId: userId,
          date: dateString,
          loginTime: serverTimestamp(),
          logoutTime: null,
          status: "active",
          timeLog: []
        });
        
        // Immediately set the login time in state to avoid delay
        setTodayLog({
          loginTime: new Date(),
          logoutTime: null,
          status: "active",
        });
      }
    } catch (err) {
      console.error("Error saving login time:", err);
    }
  };

  useEffect(() => {
    if (!currentUser?.id) return; 
    
    console.log("currentUser:", currentUser);
    console.log("currentUser.id:", currentUser?.id);
    
    const fetchTodayLog = async () => {
      try {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const q = query(
          collection(db, "loginLogs"),
          where("userId", "==", currentUser.id),
          where("date", "==", dateString),
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setTodayLog({
            loginTime: data.loginTime?.toDate() || null,
            logoutTime: data.logoutTime?.toDate() || null,
            status: data.status,
          });
        } else {
          setTodayLog(null);
        }
      } catch (err) {
        console.error("Error fetching today log:", err);
      } finally {
        setIsLoadingLog(false);
      }
    };

    const init = async () => {
      setIsLoadingLog(true);
      await saveLoginTime(currentUser.id); 
      await fetchTodayLog();               
    };
    
    init();
    
    const interval = setInterval(fetchTodayLog, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Add this AFTER imports and BEFORE export default function Dashboard()
  const UserInfoDisplay = ({ currentUser }) => {
    if (!currentUser) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-gray-500">Loading user info...</span>
        </div>
      );
    }

    const getDisplayRole = () => {
      if (currentUser.role === "admin") {
        return "Admin";
      }
      return currentUser.department || "User";
    };

    return (
      <div className="flex  items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-semibold text-lg">
          {currentUser.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {currentUser.name || "User"}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getDisplayRole()}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentUser.email || "Email"}
          </span>
        </div>
      </div>
    );
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    pendingReview: projects.filter((p) => p.status === "Review").length,
    delivered: projects.filter((p) => p.status === "Delivered").length,
  };

  return (
    <div className="space-y-6 pb-6 ">
      {/* Header */}
      <div className="px-8 py-1.5 border-b sticky top-0 z-40 bg-white  ">
        <h1 className=" text-2xl font-bold capitalize">
          {" "}
          Hello, {currentUser?.name}
        </h1>
        <p className="text-black/50 text-sm font-bold">
          {currentUser?.department} &nbsp;|&nbsp; Vernoxy Media
        </p>

        {/* login and logout display with loading state */}
        <div className="flex items-center gap-6 py-5 rounded-xl w-[20%] ">
          {/* Login Time */}
          <div className="flex items-center gap-2 ">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 leading-none mb-0.5">Login</p>
              {isLoadingLog ? (
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-sm font-semibold text-emerald-700">
                  {todayLog ? fmtTime(todayLog.loginTime) : "—"}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 " />
          
          {/* Logout Time */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 leading-none mb-0.5">
                Logout
              </p>
              {isLoadingLog ? (
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-sm font-semibold text-sky-700">
                  {todayLog?.logoutTime ? fmtTime(todayLog.logoutTime) : "—"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-8">
        <StatCard
          title="Total Projects"
          value={stats.total}
          icon={FolderKanban}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          subtitle="Active work"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={Users}
          subtitle="Awaiting feedback"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
          subtitle="This month"
        />
      </div>

      {/* Breakdown Cards */}
      <div className="px-8 grid gap-6 lg:grid-cols-2">
        <StatusBreakdown projects={projects} />
        <ServiceBreakdown projects={projects} />
      </div>

      {/* Recent Projects */}
      <div className="px-8">
        <RecentProjects projects={projects} />
      </div>
      <Footer />
    </div>
  );
}