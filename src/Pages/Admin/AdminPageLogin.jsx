import React, { useState } from "react";
import {
  Clock,
  Briefcase,
  Calendar,
  Save,
  List,
  PlusCircle,
  CheckCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";

const AdmerPageLogin = () => {
  // Simulated employee data - in production this would come from login
  const [currentEmployee, setCurrentEmployee] = useState({
    id: 1,
    name: "kishan Parmar",
    department: "Social Media",
    role: "Social Media Manager",
  });

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Client Instagram Campaign",
      type: "Social Media",
      status: "Active",
    },
    {
      id: 2,
      name: "Facebook Ad Management",
      type: "Social Media",
      status: "Active",
    },
    {
      id: 3,
      name: "LinkedIn Content Strategy",
      type: "Social Media",
      status: "Active",
    },
    {
      id: 4,
      name: "E-commerce Website",
      type: "Web Development",
      status: "Active",
    },
    {
      id: 5,
      name: "Inventory Management System",
      type: "ERP",
      status: "Active",
    },
  ]);

  const [workLogs, setWorkLogs] = useState([
    {
      id: 1,
      employeeId: 1,
      projectId: 1,
      date: new Date().toISOString().split("T")[0],
      task: "Created 5 Instagram posts with graphics",
      hoursSpent: 3.5,
      status: "Completed",
      startTime: "09:00",
      endTime: "12:30",
    },
  ]);

  const [activeView, setActiveView] = useState("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [newWorkLog, setNewWorkLog] = useState({
    projectId: "",
    task: "",
    hoursSpent: "",
    status: "In Progress",
    startTime: "",
    endTime: "",
  });

  // Quick task presets
  const taskPresets = {
    "Social Media": [
      "Content creation and posting",
      "Social media strategy planning",
      "Community management and engagement",
      "Analytics and reporting",
      "Campaign management",
      "Influencer outreach",
    ],
    "Web Development": [
      "Frontend development",
      "Backend API development",
      "Bug fixing and testing",
      "Database optimization",
      "UI/UX implementation",
      "Code review",
    ],
    ERP: [
      "Module customization",
      "Database design",
      "API integration",
      "User training",
      "Testing and QA",
      "Documentation",
    ],
  };

  const addWorkLog = () => {
    if (newWorkLog.projectId && newWorkLog.task && newWorkLog.hoursSpent) {
      const log = {
        ...newWorkLog,
        id: workLogs.length + 1,
        employeeId: currentEmployee.id,
        date: selectedDate,
        hoursSpent: parseFloat(newWorkLog.hoursSpent),
      };
      setWorkLogs([...workLogs, log]);
      setNewWorkLog({
        projectId: "",
        task: "",
        hoursSpent: "",
        status: "In Progress",
        startTime: "",
        endTime: "",
      });
    }
  };

  const updateWorkLogStatus = (id, newStatus) => {
    setWorkLogs(
      workLogs.map((log) =>
        log.id === id ? { ...log, status: newStatus } : log
      )
    );
  };

  const deleteWorkLog = (id) => {
    setWorkLogs(workLogs.filter((log) => log.id !== id));
  };

  const getProjectName = (id) => {
    const proj = projects.find((p) => p.id === parseInt(id));
    return proj ? proj.name : "Unknown";
  };

  const getTodayWorkLogs = () => {
    return workLogs.filter(
      (log) =>
        log.employeeId === currentEmployee.id && log.date === selectedDate
    );
  };

  const getTotalHoursToday = () => {
    return getTodayWorkLogs().reduce((sum, log) => sum + log.hoursSpent, 0);
  };

  const getWeeklyHours = () => {
    const today = new Date(selectedDate);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    return workLogs
      .filter((log) => {
        const logDate = new Date(log.date);
        return log.employeeId === currentEmployee.id && logDate >= weekStart;
      })
      .reduce((sum, log) => sum + log.hoursSpent, 0);
  };

  const calculateHours = () => {
    if (newWorkLog.startTime && newWorkLog.endTime) {
      const [startHour, startMin] = newWorkLog.startTime.split(":").map(Number);
      const [endHour, endMin] = newWorkLog.endTime.split(":").map(Number);
      const hours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
      if (hours > 0) {
        setNewWorkLog({ ...newWorkLog, hoursSpent: hours.toFixed(1) });
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Work Entry Portal
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {currentEmployee.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Department</p>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {currentEmployee.department}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-medium text-gray-700">
                  {currentEmployee.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hours Today</p>
                <p className="text-3xl font-bold text-gray-800">
                  {getTotalHoursToday().toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-3xl font-bold text-gray-800">
                  {
                    getTodayWorkLogs().filter((l) => l.status === "Completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Hours</p>
                <p className="text-3xl font-bold text-gray-800">
                  {getWeeklyHours().toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("today")}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                activeView === "today"
                  ? "bg-blue-600 "
                  : "text-gray-800 hover:bg-gray-100 bg-white"
              }`}
            >
              Today's Work
            </button>
            {/* <button
              onClick={() => setActiveView("add")}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                activeView === "add"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Add New Entry
            </button> */}
            <button
              onClick={() => setActiveView("history")}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                activeView === "history"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Work History
            </button>
          </div>
        </div>

        {/* Add Work Entry View */}
        {activeView === "add" && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PlusCircle className="w-7 h-7 text-blue-600" />
              Log Your Work
            </h2>

            <div className=" grid grid-cols-1 md:grid-cols-2 gap-9">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 ">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 ">
                  Project *
                </label>
                <input
                  type="text"
                  value={newWorkLog.projectId}
                  onChange={(e) =>
                    setNewWorkLog({ ...newWorkLog, projectId: e.target.value })
                  }
                  placeholder="Enter project name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What did you work on? *
                </label>
                <textarea
                  placeholder="Describe your task in detail..."
                  value={newWorkLog.task}
                  onChange={(e) =>
                    setNewWorkLog({ ...newWorkLog, task: e.target.value })
                  }
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                />
              </div>

              {/* Time Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
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
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-4 text-xs md:text-sm">
                  {["In Progress", "Completed", "Pending"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setNewWorkLog({ ...newWorkLog, status })}
                      className={`px-4 py-3 rounded-lg font-medium transition ${
                        newWorkLog.status === status
                          ? status === "Completed"
                            ? "bg-green-500 text-white"
                            : status === "In Progress"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={addWorkLog}
                disabled={
                  !newWorkLog.projectId ||
                  !newWorkLog.task ||
                  !newWorkLog.hoursSpent
                }
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-6 h-6" />
                Save Work Entry
              </button>
            </div>
          </div>
        )}

        {/* Today's Work View */}
        {activeView === "today" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Today's Activities
              </h2>
              <div className="text-sm text-gray-600">{selectedDate}</div>
            </div>

            {getTodayWorkLogs().length > 0 ? (
              <div className="space-y-4">
                {getTodayWorkLogs().map((log) => (
                  <div
                    key={log.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-bold text-gray-800">
                            {getProjectName(log.projectId)}
                          </h3>
                        </div>
                        <p className="text-gray-700 ml-8">{log.task}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateWorkLogStatus(log.id, "Completed")
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteWorkLog(log.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 ml-8 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {log.hoursSpent} hours
                        </span>
                      </div>
                      {log.startTime && log.endTime && (
                        <div className="text-gray-600">
                          {log.startTime} - {log.endTime}
                        </div>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No work logged yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start logging your work for today
                </p>
                <button
                  onClick={() => setActiveView("add")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Add Work Entry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Work History View */}
        {activeView === "history" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Work History</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Task
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Hours
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {workLogs
                    .filter((log) => log.employeeId === currentEmployee.id)
                    .slice()
                    .reverse()
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          {getProjectName(log.projectId)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.task}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.hoursSpent}h
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              log.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : log.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmerPageLogin;
