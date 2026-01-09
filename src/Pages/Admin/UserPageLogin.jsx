import React, { useState, useEffect } from "react";
import {
  Clock,
  Briefcase,
  Save,
  PlusCircle,
  CheckCircle,
  XCircle,
  Coffee,
  AlertCircle,
  MessageSquare,
  Users,
  TrendingUp,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUJY3MJuYmDwriz_VtF4fkjcGhBQcX78M",
  authDomain: "vernoxy-media.firebaseapp.com",
  projectId: "vernoxy-media",
  storageBucket: "vernoxy-media.firebasestorage.app",
  messagingSenderId: "29003109920",
  appId: "1:29003109920:web:f3115a221f201a04434e45",
  measurementId: "G-8PKSEKJVM5",
};

// Initialize Firebase - CORRECT ORDER
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const UserPageLogin = () => {
  const [currentEmployee] = useState({
    id: 1,
    name: "Rahul Sharma",
    department: "Social Media",
    role: "Social Media Manager",
  });

  const [projects] = useState([
    { id: 1, name: "Instagram Campaign", type: "Social Media" },
    { id: 2, name: "Facebook Ads", type: "Social Media" },
    { id: 3, name: "LinkedIn Strategy", type: "Social Media" },
  ]);

  const [teamMembers] = useState([
    { id: 1, name: "Dhruv mistry", role: "Front-End Developer" },
    { id: 2, name: "Nikhil Lad", role: "Designer" },
    { id: 3, name: "Tilak tiwari", role: "Designer" },
    { id: 4, name: "Bhumika Patel", role: "Content Writer" },
    {
      id: 5,
      name: "Vrunda Patel",
      role: ["Front-End Developer", "Back-End Developer"],
    },
    { id: 6, name: "Divya Patel", role: "Front-End Developer" },
    { id: 7, name: "Jenil Dhimmar", role: "Video Editor" },
  ]);

  const [workLogs, setWorkLogs] = useState([]);
  const [activeView, setActiveView] = useState("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const [newWorkLog, setNewWorkLog] = useState({
    projectId: "",
    task: "",
    hoursSpent: "",
    breakTime: "",
    status: "In Progress",
    priority: "Medium",
    startHour: "",
    startMinute: "",
    startAMPM: "AM",
    endHour: "",
    endMinute: "",
    endAMPM: "PM",
    notes: "",
    blockers: "",
    collaborators: [],
    mood: "neutral",
  });
  const calculateHours = () => {
    const { startHour, startMinute, startAMPM, endHour, endMinute, endAMPM } =
      newWorkLog;

    if (startHour && startMinute !== "" && endHour && endMinute !== "") {
      // Convert to 24-hour format
      let startHours24 = parseInt(startHour);
      let endHours24 = parseInt(endHour);

      if (startAMPM === "PM" && startHours24 !== 12) startHours24 += 12;
      if (startAMPM === "AM" && startHours24 === 12) startHours24 = 0;
      if (endAMPM === "PM" && endHours24 !== 12) endHours24 += 12;
      if (endAMPM === "AM" && endHours24 === 12) endHours24 = 0;

      // Calculate difference
      let startTotalMinutes = startHours24 * 60 + parseInt(startMinute);
      let endTotalMinutes = endHours24 * 60 + parseInt(endMinute);

      if (endTotalMinutes < startTotalMinutes) {
        endTotalMinutes += 24 * 60;
      }

      const diffMinutes = endTotalMinutes - startTotalMinutes;
      const hours = diffMinutes / 60;

      if (hours > 0) {
        setNewWorkLog((prev) => ({ ...prev, hoursSpent: hours.toFixed(1) }));
      }
    }
  };
  const [showAllCollaborators, setShowAllCollaborators] = useState(false);

  useEffect(() => {
    calculateHours();
  }, [
    newWorkLog.startHour,
    newWorkLog.startMinute,
    newWorkLog.startAMPM,
    newWorkLog.endHour,
    newWorkLog.endMinute,
    newWorkLog.endAMPM,
  ]);
  // Sign in anonymously when component mounts
  useEffect(() => {
    signInAnonymously(auth)
      .then(() => console.log("✅ Signed in anonymously"))
      .catch((error) => console.error("❌ Auth error:", error));
  }, []);

  // Load work logs from Firebase on component mount
  useEffect(() => {
    loadWorkLogs();
  }, [selectedDate]);

  const loadWorkLogs = async () => {
    try {
      const q = query(
        collection(db, "workLogs"),
        where("employeeId", "==", currentEmployee.id),
        where("date", "==", selectedDate)
      );

      const querySnapshot = await getDocs(q);
      const logs = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setWorkLogs(logs);
    } catch (error) {
      console.error("Error loading work logs:", error);
    }
  };

  const addWorkLog = async () => {
    if (newWorkLog.projectId && newWorkLog.task && newWorkLog.hoursSpent) {
      setIsSubmitting(true);
      setSubmitStatus(null);

      try {
        const workLogData = {
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          department: currentEmployee.department,
          role: currentEmployee.role,
          projectId: newWorkLog.projectId,
          projectName: newWorkLog.projectId,
          task: newWorkLog.task,
          date: selectedDate,
          hoursSpent: parseFloat(newWorkLog.hoursSpent),
          breakTime: parseFloat(newWorkLog.breakTime) || 0,
          status: newWorkLog.status,
          priority: newWorkLog.priority,
          startTime: `${newWorkLog.startHour}:${String(
            newWorkLog.startMinute
          ).padStart(2, "0")} ${newWorkLog.startAMPM}`,
          endTime: `${newWorkLog.endHour}:${String(
            newWorkLog.endMinute
          ).padStart(2, "0")} ${newWorkLog.endAMPM}`,
          notes: newWorkLog.notes,
          blockers: newWorkLog.blockers,
          collaborators: newWorkLog.collaborators,
          collaboratorNames: newWorkLog.collaborators.map((id) =>
            getMemberName(id)
          ),
          mood: newWorkLog.mood,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "workLogs"), workLogData);
        console.log("✅ Work log saved to Firebase with ID:", docRef.id);

        setSubmitStatus({
          type: "success",
          message: "✅ Work entry saved successfully!",
        });

        // Reset form
        setNewWorkLog({
          projectId: "",
          task: "",
          hoursSpent: "",
          breakTime: "",
          status: "In Progress",
          priority: "Medium",
          startTime: "",
          endTime: "",
          notes: "",
          blockers: "",
          collaborators: [],
          mood: "neutral",
        });

        // Reload work logs
        await loadWorkLogs();

        // Switch to today view
        setTimeout(() => {
          setActiveView("today");
          setSubmitStatus(null);
        }, 2000);
      } catch (error) {
        console.error("❌ Error saving work log:", error);
        setSubmitStatus({
          type: "error",
          message: `❌ Error saving work entry: ${error.message}`,
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setSubmitStatus({
        type: "error",
        message: "⚠️ Please fill in all required fields (Project, Task, Hours)",
      });
    }
  };

  const deleteWorkLog = async (id) => {
    try {
      await deleteDoc(doc(db, "workLogs", id));
      console.log("✅ Work log deleted from Firebase");
      await loadWorkLogs();
    } catch (error) {
      console.error("❌ Error deleting work log:", error);
    }
  };

  const toggleCollaborator = (memberId) => {
    const collaborators = newWorkLog.collaborators || [];
    if (collaborators.includes(memberId)) {
      setNewWorkLog({
        ...newWorkLog,
        collaborators: collaborators.filter((id) => id !== memberId),
      });
    } else {
      setNewWorkLog({
        ...newWorkLog,
        collaborators: [...collaborators, memberId],
      });
    }
  };

  const getTodayWorkLogs = () => {
    return workLogs.filter(
      (log) =>
        log.employeeId === currentEmployee.id && log.date === selectedDate
    );
  };

  const getTotalHours = () => {
    return getTodayWorkLogs().reduce((sum, log) => sum + log.hoursSpent, 0);
  };

  const getTotalBreaks = () => {
    return getTodayWorkLogs().reduce(
      (sum, log) => sum + (log.breakTime || 0),
      0
    );
  };

  const getCompleted = () => {
    return getTodayWorkLogs().filter((l) => l.status === "Completed").length;
  };

  const getProductivity = () => {
    const logs = getTodayWorkLogs();
    if (logs.length === 0) return 0;
    const completed = logs.filter((l) => l.status === "Completed").length;
    const highPriority = logs.filter(
      (l) => l.status === "Completed" && l.priority === "High"
    ).length;
    return Math.min(100, completed * 20 + highPriority * 10);
  };

  const getProjectName = (id) => {
    const proj = projects.find((p) => p.id === parseInt(id));
    return proj ? proj.name : id;
  };

  const getMemberName = (id) => {
    const member = teamMembers.find((m) => m.id === id);
    return member ? member.name : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Employee Work Portal
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {currentEmployee.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Department</p>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                {currentEmployee.department}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Work Hours</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getTotalHours().toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Coffee className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Break Time</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getTotalBreaks().toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getCompleted()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Productivity</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getProductivity()}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-6 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveView("today")}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeView === "today"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Today's Work
            </button>
            <button
              onClick={() => setActiveView("add")}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeView === "add"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Add Entry
            </button>
          </div>
        </div>

        {submitStatus && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        {activeView === "add" && (
          <div className="bg-white rounded-xl shadow-lg p-9 ">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PlusCircle className="w-7 h-7 text-blue-600" />
              Log Your Work
            </h2>

            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2 text-start">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-lg text-start font-semibold text-gray-800 mb-2">
                    Mood
                  </label>
                  <select
                    value={newWorkLog.mood}
                    onChange={(e) =>
                      setNewWorkLog({ ...newWorkLog, mood: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="productive">🚀 Productive</option>
                    <option value="focused">🎯 Focused</option>
                    <option value="creative">💡 Creative</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="tired">😴 Tired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                <div>
                  <label className="block text-lg text-start font-semibold text-gray-700 mb-2">
                    Project *
                  </label>
                  <input
                    type="text"
                    value={newWorkLog.projectId}
                    onChange={(e) =>
                      setNewWorkLog({
                        ...newWorkLog,
                        projectId: e.target.value,
                      })
                    }
                    placeholder="Enter project name..."
                    className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="">
                  <label className="block text-lg text-start  font-semibold text-gray-700 mb-2">
                    Priority *
                  </label>
                  <div className="grid grid-cols-3 gap-5">
                    {["High", "Medium", "Low"].map((priority) => (
                      <button
                        key={priority}
                        onClick={() =>
                          setNewWorkLog({ ...newWorkLog, priority })
                        }
                        className={`px-4 py-3 rounded-lg font-medium ${
                          newWorkLog.priority === priority
                            ? priority === "High"
                              ? "bg-red-500 text-white"
                              : priority === "Medium"
                              ? "bg-yellow-500 text-white"
                              : "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-700 "
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="">
                  <label className="block text-lg text-start font-semibold text-gray-700 mb-2">
                    Task Description *
                  </label>
                  <textarea
                    value={newWorkLog.task}
                    onChange={(e) =>
                      setNewWorkLog({ ...newWorkLog, task: e.target.value })
                    }
                    placeholder="What did you work on today?"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>
                <div>
                  <label className="block text-lg text-start font-semibold text-gray-700  flex items-center gap-2 ">
                    <Users className="w-4 h-4" />
                    Collaborators
                  </label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {(showAllCollaborators
                      ? teamMembers
                      : teamMembers.slice(0, 3)
                    ).map((member) => (
                      <button
                        key={member.id}
                        onClick={() => toggleCollaborator(member.id)}
                        className={`px-3 py-2 rounded-lg border-2 transition ${
                          newWorkLog.collaborators?.includes(member.id)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {member.name}
                      </button>
                    ))}
                    {teamMembers.length > 3 && (
                      <button
                        onClick={() =>
                          setShowAllCollaborators(!showAllCollaborators)
                        }
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
                      >
                        {showAllCollaborators
                          ? "View Less"
                          : `+${teamMembers.length - 3} More`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-7">
                {/* Start Time - with AM/PM */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newWorkLog.startTime}
                    onChange={(e) =>
                      setNewWorkLog({
                        ...newWorkLog,
                        startTime: e.target.value,
                      })
                    }
                    onBlur={calculateHours}
                    min={(() => {
                      const now = new Date();
                      const hours = String(now.getHours()).padStart(2, "0");
                      const minutes = String(now.getMinutes()).padStart(2, "0");
                      return `${hours}:${minutes}`;
                    })()}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newWorkLog.endTime}
                    onChange={(e) =>
                      setNewWorkLog({ ...newWorkLog, endTime: e.target.value })
                    }
                    onBlur={calculateHours}
                    min={
                      newWorkLog.startTime ||
                      (() => {
                        const now = new Date();
                        const hours = String(now.getHours()).padStart(2, "0");
                        const minutes = String(now.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        return `${hours}:${minutes}`;
                      })()
                    }
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hours Spent *
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={newWorkLog.hoursSpent}
                    onChange={(e) =>
                      setNewWorkLog({
                        ...newWorkLog,
                        hoursSpent: e.target.value,
                      })
                    }
                    step="0.5"
                    min="0"
                    max="24"
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-lg text-start font-semibold text-gray-700 mb-2">
                    Break (hours)
                  </label>
                  <input
                    type="number"
                    value={newWorkLog.breakTime}
                    onChange={(e) =>
                      setNewWorkLog({
                        ...newWorkLog,
                        breakTime: e.target.value,
                      })
                    }
                    placeholder="0.5"
                    step="0.25"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-lg text-start font-semibold text-gray-700 mb-2">
                    Hours Spent *
                  </label>
                  <input
                    type="number"
                    value={newWorkLog.hoursSpent}
                    onChange={(e) =>
                      setNewWorkLog({
                        ...newWorkLog,
                        hoursSpent: e.target.value,
                      })
                    }
                    placeholder="8"
                    step="0.5"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-6">
                  <label className="block text-lg text-start font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Notes
                  </label>
                  <textarea
                    value={newWorkLog.notes}
                    onChange={(e) =>
                      setNewWorkLog({ ...newWorkLog, notes: e.target.value })
                    }
                    placeholder="Additional details, achievements..."
                    className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 h-20"
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-lg text-start font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Blockers
                  </label>
                  <textarea
                    value={newWorkLog.blockers}
                    onChange={(e) =>
                      setNewWorkLog({ ...newWorkLog, blockers: e.target.value })
                    }
                    placeholder="Any issues or challenges..."
                    className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 h-20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-4 text-sm md:text-sm">
                  {["In Progress", "Completed", "Pending"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setNewWorkLog({ ...newWorkLog, status })}
                      className={`px-4 py-3 rounded-lg font-medium  ${
                        newWorkLog.status === status
                          ? status === "Completed"
                            ? "bg-green-500 text-white"
                            : status === "In Progress"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={addWorkLog}
                disabled={
                  !newWorkLog.projectId ||
                  !newWorkLog.task ||
                  !newWorkLog.hoursSpent ||
                  isSubmitting
                }
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-6 h-6" />
                {isSubmitting ? "Saving..." : "Save Work Entry"}
              </button>
            </div>
          </div>
        )}

        {activeView === "today" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Today's Activities
            </h2>
            {getTodayWorkLogs().length > 0 ? (
              <div className="space-y-4">
                {getTodayWorkLogs().map((log) => (
                  <div
                    key={log.id}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-bold">
                            {log.projectName || getProjectName(log.projectId)}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              log.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : log.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {log.priority}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2">{log.task}</p>
                      </div>
                      <button
                        onClick={() => deleteWorkLog(log.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>⏱️ {log.hoursSpent}h work</span>
                      {log.breakTime > 0 && (
                        <span>☕ {log.breakTime}h break</span>
                      )}
                      <span
                        className={`px-2 py-1 rounded ${
                          log.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : log.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    {log.collaborators?.length > 0 && (
                      <div className="text-sm text-gray-600 mb-2">
                        👥 With:{" "}
                        {log.collaboratorNames?.join(", ") ||
                          log.collaborators
                            .map((id) => getMemberName(id))
                            .join(", ")}
                      </div>
                    )}
                    {log.notes && (
                      <div className="bg-blue-50 p-3 rounded mt-3 text-sm">
                        <strong>Notes:</strong> {log.notes}
                      </div>
                    )}
                    {log.blockers && (
                      <div className="bg-red-50 p-3 rounded mt-3 text-sm">
                        <strong>⚠️ Blockers:</strong> {log.blockers}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-500 mb-4">No work logged yet today</p>
                <button
                  onClick={() => setActiveView("add")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Work Entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPageLogin;
