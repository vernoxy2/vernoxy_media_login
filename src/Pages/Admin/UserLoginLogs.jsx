// // src/Pages/Admin/UserLoginLogs.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   getLoginLogs,
//   formatSessionDuration,
// } from "../../services/loginLogService";
// import {
//   Clock,
//   UserCheck,
//   LogOut,
//   Filter,
//   Download,
//   X,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
// } from "lucide-react";

// export default function UserLoginLogs() {
//   const [logs, setLogs] = useState([]);
//   const [filteredLogs, setFilteredLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

//   // Filter states
//   const [filterRole, setFilterRole] = useState("all");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterUsername, setFilterUsername] = useState("");
//   const [filterStartDate, setFilterStartDate] = useState("");
//   const [filterEndDate, setFilterEndDate] = useState("");

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   // const [itemsPerPage] = useState(10);
//   const REFRESH_INTERVAL = 5000;
//   useEffect(() => {
//     fetchLogs();
//   }, []);

//   useEffect(() => {
//     if (!autoRefresh) return;

//     const intervalId = setInterval(() => {
//       fetchLogs(true);
//     }, REFRESH_INTERVAL);

//     return () => clearInterval(intervalId);
//   }, [autoRefresh]);

//   // Apply filters whenever logs or filter values change
//   useEffect(() => {
//     applyFilters();
//   }, [
//     logs,
//     filterRole,
//     filterStatus,
//     filterUsername,
//     filterStartDate,
//     filterEndDate,
//   ]);

//   // ✅ NEW: Only reset page when filters change (NOT when logs update)
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [
//     filterRole,
//     filterStatus,
//     filterUsername,
//     filterStartDate,
//     filterEndDate,
//   ]);
//   // ✅ ADDED THIS ENTIRE BLOCK:
//   const groupedByDate = useMemo(() => {
//     const grouped = {};

//     filteredLogs.forEach((log) => {
//       if (!log.loginTime) return;
//       // Get the date from loginTime
//       const date = new Date(log.loginTime);
//       const dateKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
//       if (!grouped[dateKey]) {
//         grouped[dateKey] = [];
//       }
//       grouped[dateKey].push(log);
//     });
//     // Sort dates in descending order (newest first)
//     const sortedDates = Object.keys(grouped).sort(
//       (a, b) => new Date(b) - new Date(a),
//     );
//     return { grouped, sortedDates };
//   }, [filteredLogs]);

//   const fetchLogs = async (isAutoRefresh = false) => {
//     try {
//       // Only show loading spinner for manual refresh, not auto-refresh
//       if (!isAutoRefresh) {
//         setLoading(true);
//       }

//       const allLogs = await getLoginLogs({});
//       setLogs(allLogs);
//       console.log("✅ Fetched login logs currant", allLogs.loginTime);
//       setLastRefreshTime(new Date());
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching login logs:", err);
//       setError("Failed to load login logs. Please try again.");
//     } finally {
//       if (!isAutoRefresh) {
//         setLoading(false);
//       }
//     }
//   };

//   const handleManualRefresh = () => {
//     fetchLogs(false);
//   };

//   const toggleAutoRefresh = () => {
//     setAutoRefresh(!autoRefresh);
//   };

//   const formatTimeSinceRefresh = () => {
//     const seconds = Math.floor((new Date() - lastRefreshTime) / 1000);
//     if (seconds < 60) return `${seconds}s ago`;
//     const minutes = Math.floor(seconds / 60);
//     return `${minutes}m ago`;
//   };

//   const applyFilters = () => {
//     let filtered = [...logs];

//     // Filter by role
//     if (filterRole !== "all") {
//       filtered = filtered.filter((log) => log.role === filterRole);
//     }

//     // Filter by status
//     if (filterStatus !== "all") {
//       filtered = filtered.filter((log) => log.status === filterStatus);
//     }

//     // Filter by username (search in userName and email)
//     if (filterUsername.trim()) {
//       const searchTerm = filterUsername.toLowerCase().trim();
//       filtered = filtered.filter(
//         (log) =>
//           log.userName?.toLowerCase().includes(searchTerm) ||
//           log.email?.toLowerCase().includes(searchTerm),
//       );
//     }

//     // Filter by date range
//     if (filterStartDate) {
//       const startDate = new Date(filterStartDate);
//       startDate.setHours(0, 0, 0, 0);
//       filtered = filtered.filter((log) => {
//         if (!log.loginTime) return false;
//         const logDate = new Date(log.loginTime);
//         return logDate >= startDate;
//       });
//     }

//     if (filterEndDate) {
//       const endDate = new Date(filterEndDate);
//       endDate.setHours(23, 59, 59, 999);
//       filtered = filtered.filter((log) => {
//         if (!log.loginTime) return false;
//         const logDate = new Date(log.loginTime);
//         return logDate <= endDate;
//       });
//     }

//     setFilteredLogs(filtered);
//   };

//   const clearFilters = () => {
//     setFilterRole("all");
//     setFilterStatus("all");
//     setFilterUsername("");
//     setFilterStartDate("");
//     setFilterEndDate("");
//   };

//   const hasActiveFilters = () => {
//     return (
//       filterRole !== "all" ||
//       filterStatus !== "all" ||
//       filterUsername.trim() !== "" ||
//       filterStartDate !== "" ||
//       filterEndDate !== ""
//     );
//   };

//   const formatDate = (date) => {
//     if (!date) return "N/A";
//     try {
//       return new Date(date).toLocaleString("en-IN", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: true,
//       });
//     } catch (err) {
//       console.error("Error formatting date:", err);
//       return "Invalid Date";
//     }
//   };

//   const exportToCSV = () => {
//     try {
//       const headers = [
//         "User Name",
//         "Email",
//         "Role",
//         "Department",
//         "Login Time",
//         "Logout Time",
//         "Session Duration",
//         "Status",
//       ];
//       const csvData = filteredLogs.map((log) => [
//         log.userName || "N/A",
//         log.email || "N/A",
//         log.role || "N/A",
//         log.department || "N/A",
//         formatDate(log.loginTime),
//         formatDate(log.logoutTime),
//         formatSessionDuration(log.sessionDuration),
//         log.status || "N/A",
//       ]);

//       const csvContent = [
//         headers.join(","),
//         ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
//       ].join("\n");

//       const blob = new Blob([csvContent], { type: "text/csv" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `login-logs-${new Date().toISOString().split("T")[0]}.csv`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Error exporting CSV:", err);
//       alert("Failed to export CSV. Please try again.");
//     }
//   };

//   const totalPages = groupedByDate.sortedDates.length;
//   const currentItems = useMemo(() => {
//     if (groupedByDate.sortedDates.length === 0) return [];
//     const currentDateKey = groupedByDate.sortedDates[currentPage - 1];
//     return groupedByDate.grouped[currentDateKey] || [];
//   }, [groupedByDate, currentPage]);
//   const currentDate = groupedByDate.sortedDates[currentPage - 1];
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) pageNumbers.push(i);
//         pageNumbers.push("...");
//         pageNumbers.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pageNumbers.push(1);
//         pageNumbers.push("...");
//         for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
//       } else {
//         pageNumbers.push(1);
//         pageNumbers.push("...");
//         for (let i = currentPage - 1; i <= currentPage + 1; i++)
//           pageNumbers.push(i);
//         pageNumbers.push("...");
//         pageNumbers.push(totalPages);
//       }
//     }

//     return pageNumbers;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading login logs...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               User Login Logs
//             </h1>
//             <p className="text-gray-600">
//               Monitor user login and logout activities
//             </p>
//           </div>

//           {/* Auto-refresh controls */}
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <span>Last updated: {formatTimeSinceRefresh()}</span>
//             </div>
//             <button
//               onClick={handleManualRefresh}
//               className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               title="Refresh now"
//             >
//               <RefreshCw className="w-4 h-4" />
//               <span className="hidden sm:inline">Refresh</span>
//             </button>
//             <button
//               onClick={toggleAutoRefresh}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 autoRefresh
//                   ? "bg-green-100 text-green-700 border border-green-300"
//                   : "bg-gray-100 text-gray-700 border border-gray-300"
//               }`}
//               title={autoRefresh ? "Auto-refresh is ON" : "Auto-refresh is OFF"}
//             >
//               <div
//                 className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
//               ></div>
//               <span className="hidden sm:inline">
//                 Auto-refresh {autoRefresh ? "ON" : "OFF"}
//               </span>
//               <span className="sm:hidden">{autoRefresh ? "ON" : "OFF"}</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Total Logs</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">
//                 {filteredLogs.length}
//               </p>
//               {hasActiveFilters() && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   of {logs.length} total
//                 </p>
//               )}
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//               <Clock className="w-6 h-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-medium">
//                 Active Sessions
//               </p>
//               <p className="text-3xl font-bold text-green-600 mt-2">
//                 {filteredLogs.filter((log) => log.status === "active").length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//               <UserCheck className="w-6 h-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-medium">
//                 Completed Sessions
//               </p>
//               <p className="text-3xl font-bold text-gray-600 mt-2">
//                 {
//                   filteredLogs.filter(
//                     (log) =>
//                       log.status === "completed" ||
//                       log.status === "auto-completed",
//                   ).length
//                 }
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
//               <LogOut className="w-6 h-6 text-gray-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
//           {/* Full Width Search Bar */}
//           <div className="flex-1 w-full">
//             <input
//               type="text"
//               placeholder="Search by name or email..."
//               value={filterUsername}
//               onChange={(e) => setFilterUsername(e.target.value)}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3 w-full sm:w-auto">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm font-medium ${
//                 showFilters || hasActiveFilters()
//                   ? "bg-blue-50 border-blue-300 text-blue-700"
//                   : "border-gray-300 text-gray-700 hover:bg-gray-50"
//               }`}
//             >
//               <Filter className="w-4 h-4" />
//               Filters
//               {hasActiveFilters() && (
//                 <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
//                   {
//                     [
//                       filterRole !== "all",
//                       filterStatus !== "all",
//                       filterStartDate,
//                       filterEndDate,
//                     ].filter(Boolean).length
//                   }
//                 </span>
//               )}
//             </button>

//             <button
//               onClick={exportToCSV}
//               disabled={filteredLogs.length === 0}
//               className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
//             >
//               <Download className="w-4 h-4" />
//               <span className="hidden sm:inline">Export CSV</span>
//               <span className="sm:hidden">CSV</span>
//             </button>
//           </div>
//         </div>

//         {/* Collapsible Filters Section */}
//         {showFilters && (
//           <div className="mt-4 pt-4 border-t border-gray-200">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Role Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Role
//                 </label>
//                 <select
//                   value={filterRole}
//                   onChange={(e) => setFilterRole(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 >
//                   <option value="all">All Roles</option>
//                   <option value="admin">Admin</option>
//                   <option value="user">User</option>
//                 </select>
//               </div>

//               {/* Status Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <select
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="active">Active</option>
//                   <option value="completed">Completed</option>
//                 </select>
//               </div>

//               {/* Start Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   From Date
//                 </label>
//                 <input
//                   type="date"
//                   value={filterStartDate}
//                   onChange={(e) => setFilterStartDate(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 />
//               </div>

//               {/* End Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   To Date
//                 </label>
//                 <input
//                   type="date"
//                   value={filterEndDate}
//                   onChange={(e) => setFilterEndDate(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 />
//               </div>
//             </div>

//             {/* Clear Filters Button */}
//             {hasActiveFilters() && (
//               <div className="mt-4 flex justify-end">
//                 <button
//                   onClick={clearFilters}
//                   className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
//                 >
//                   <X className="w-4 h-4" />
//                   Clear All Filters
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//           <p className="text-red-800">{error}</p>
//         </div>
//       )}

//       {/* Logs Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Role
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Department
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Login Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Logout Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Duration
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {currentItems.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="7"
//                     className="px-6 py-12 text-center text-gray-500"
//                   >
//                     {hasActiveFilters()
//                       ? "No logs match your filters"
//                       : "No login logs found"}
//                   </td>
//                 </tr>
//               ) : (
//                 currentItems.map((log, index) => (
//                   <tr
//                     key={log.id || `log-${index}`}
//                     className="hover:bg-gray-50"
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                           <span className="text-blue-600 font-semibold">
//                             {log.userName?.charAt(0).toUpperCase() ||
//                               log.email?.charAt(0).toUpperCase() ||
//                               "?"}
//                           </span>
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">
//                             {log.userName || "N/A"}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {log.email || "N/A"}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           log.role === "admin"
//                             ? "bg-purple-100 text-purple-800"
//                             : "bg-blue-100 text-blue-800"
//                         }`}
//                       >
//                         {log.role?.toUpperCase() || "N/A"}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {log.department || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {formatDate(log.loginTime)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {formatDate(log.logoutTime)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {formatSessionDuration(log.sessionDuration)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           log.status === "active"
//                             ? "bg-green-100 text-green-800"
//                             : log.status === "auto-completed"
//                               ? "bg-orange-100 text-orange-800"
//                               : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {log.status === "active"
//                           ? "Active"
//                           : log.status === "auto-completed"
//                             ? "Auto-Completed"
//                             : "Completed"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {filteredLogs.length > 0 && (
//           <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
//             <div className="flex-1 flex justify-between sm:hidden">
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Next
//               </button>
//             </div>
//             <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-sm text-gray-700">
//                   Showing{" "}
//                   <span className="font-medium">{currentItems.length}</span>{" "}
//                   logs from{" "}
//                   <span className="font-medium">
//                     {currentDate
//                       ? new Date(currentDate).toLocaleDateString("en-GB", {
//                           day: "2-digit",
//                           month: "short",
//                           year: "numeric",
//                         })
//                       : "N/A"}
//                   </span>{" "}
//                   (Page <span className="font-medium">{currentPage}</span> of{" "}
//                   <span className="font-medium">{totalPages}</span>)
//                 </p>
//               </div>
//               <div>
//                 <nav
//                   className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
//                   aria-label="Pagination"
//                 >
//                   <button
//                     onClick={() => paginate(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <span className="sr-only">Previous</span>
//                     <ChevronLeft className="h-5 w-5" />
//                   </button>

//                   {getPageNumbers().map((pageNumber, index) =>
//                     pageNumber === "..." ? (
//                       <span
//                         key={`ellipsis-${index}`}
//                         className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
//                       >
//                         ...
//                       </span>
//                     ) : (
//                       <button
//                         key={pageNumber}
//                         onClick={() => paginate(pageNumber)}
//                         className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
//                           currentPage === pageNumber
//                             ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
//                             : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
//                         }`}
//                       >
//                         {pageNumber}
//                       </button>
//                     ),
//                   )}

//                   <button
//                     onClick={() => paginate(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <span className="sr-only">Next</span>
//                     <ChevronRight className="h-5 w-5" />
//                   </button>
//                 </nav>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/Pages/Admin/UserLoginLogs.jsx
// src/Pages/Admin/UserLoginLogs.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  getLoginLogs,
  formatSessionDuration,
} from "../../services/loginLogService";
import {
  Clock,
  UserCheck,
  LogOut,
  Filter,
  Download,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function UserLoginLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get yesterday's date in YYYY-MM-DD format
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  // Filter states - DEFAULT TO TODAY
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterStartDate, setFilterStartDate] = useState(getTodayDate());
  const [filterEndDate, setFilterEndDate] = useState(getTodayDate());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const REFRESH_INTERVAL = 5000;

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchLogs(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [autoRefresh]);

  // Apply filters whenever logs or filter values change
  useEffect(() => {
    applyFilters();
  }, [
    logs,
    filterRole,
    filterStatus,
    filterUsername,
    filterStartDate,
    filterEndDate,
  ]);

  // Reset page when filters change (NOT when logs update)
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterRole,
    filterStatus,
    filterUsername,
    filterStartDate,
    filterEndDate,
  ]);

  // Group logs by date
  const groupedByDate = useMemo(() => {
    const grouped = {};

    filteredLogs.forEach((log) => {
      if (!log.loginTime) return;
      const date = new Date(log.loginTime);
      const dateKey = date.toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(log);
    });

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b) - new Date(a),
    );
    return { grouped, sortedDates };
  }, [filteredLogs]);

  // Get unique user names for the filter dropdown
  const uniqueUserNames = useMemo(() => {
    const names = new Set();
    logs.forEach((log) => {
      if (log.userName) {
        names.add(log.userName);
      }
    });
    return Array.from(names).sort();
  }, [logs]);

  const fetchLogs = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }

      const allLogs = await getLoginLogs({});
      setLogs(allLogs);
      // console.log("✅ Fetched login logs", allLogs);
      setLastRefreshTime(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching login logs:", err);
      setError("Failed to load login logs. Please try again.");
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchLogs(false);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const formatTimeSinceRefresh = () => {
    const seconds = Math.floor((new Date() - lastRefreshTime) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filter by user name (changed from role)
    if (filterRole !== "all") {
      filtered = filtered.filter((log) => log.userName === filterRole);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((log) => log.status === filterStatus);
    }

    // Filter by username
    if (filterUsername.trim()) {
      const searchTerm = filterUsername.toLowerCase().trim();
      filtered = filtered.filter(
        (log) =>
          log.userName?.toLowerCase().includes(searchTerm) ||
          log.email?.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by date range
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((log) => {
        if (!log.loginTime) return false;
        const logDate = new Date(log.loginTime);
        return logDate >= startDate;
      });
    }

    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => {
        if (!log.loginTime) return false;
        const logDate = new Date(log.loginTime);
        return logDate <= endDate;
      });
    }

    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setFilterRole("all");
    setFilterStatus("all");
    setFilterUsername("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  // Quick date filters
  const setTodayFilter = () => {
    const today = getTodayDate();
    setFilterStartDate(today);
    setFilterEndDate(today);
  };

  const setYesterdayFilter = () => {
    const yesterday = getYesterdayDate();
    setFilterStartDate(yesterday);
    setFilterEndDate(yesterday);
  };

  const hasActiveFilters = () => {
    return (
      filterRole !== "all" ||
      filterStatus !== "all" ||
      filterUsername.trim() !== "" ||
      filterStartDate !== "" ||
      filterEndDate !== ""
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid Date";
    }
  };

  const exportToCSV = () => {
    try {
      const headers = [
        "User Name",
        "Email",
        "Role",
        "Department",
        "Login Time",
        "Logout Time",
        "Session Duration",
        "Status",
      ];
      const csvData = filteredLogs.map((log) => [
        log.userName || "N/A",
        log.email || "N/A",
        log.role || "N/A",
        log.department || "N/A",
        formatDate(log.loginTime),
        formatDate(log.logoutTime),
        formatSessionDuration(log.sessionDuration),
        log.status || "N/A",
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `login-logs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export CSV. Please try again.");
    }
  };

  const totalPages = groupedByDate.sortedDates.length;
  const currentItems = useMemo(() => {
    if (groupedByDate.sortedDates.length === 0) return [];
    const currentDateKey = groupedByDate.sortedDates[currentPage - 1];
    return groupedByDate.grouped[currentDateKey] || [];
  }, [groupedByDate, currentPage]);
  
  const currentDate = groupedByDate.sortedDates[currentPage - 1];

  // Calculate stats for CURRENT PAGE DATE ONLY
  const dayWiseStats = useMemo(() => {
    let totalPunchIns = 0;
    let totalPunchOuts = 0;
    let activeCount = 0;
    let completedCount = 0;

    currentItems.forEach((log) => {
      if (log.loginTime) totalPunchIns++;
      if (log.logoutTime) totalPunchOuts++;
      if (log.status === "active") activeCount++;
      if (log.status === "completed" || log.status === "auto-completed") completedCount++;
    });

    return {
      totalPunchIns,
      totalPunchOuts,
      activeCount,
      completedCount,
    };
  }, [currentItems]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++)
          pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading login logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              User Login Logs
            </h1>
            <p className="text-gray-600">
              Monitor user login and logout activities - Showing{" "}
              {filterStartDate === filterEndDate ? (
                <span className="font-semibold">
                  {filterStartDate === getTodayDate()
                    ? "Today's"
                    : new Date(filterStartDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                </span>
              ) : (
                <span className="font-semibold">Date Range</span>
              )}{" "}
              data
            </p>
          </div>

          {/* Auto-refresh controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Last updated: {formatTimeSinceRefresh()}</span>
            </div>
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                autoRefresh
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
              title={autoRefresh ? "Auto-refresh is ON" : "Auto-refresh is OFF"}
            >
              <div
                className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
              ></div>
              <span className="hidden sm:inline">
                Auto-refresh {autoRefresh ? "ON" : "OFF"}
              </span>
              <span className="sm:hidden">{autoRefresh ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - DAY-WISE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Punch-Ins</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {dayWiseStats.totalPunchIns}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentDate 
                  ? `on ${new Date(currentDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}`
                  : "for selected period"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Punch-Outs</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {dayWiseStats.totalPunchOuts}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Sessions</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {dayWiseStats.activeCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {dayWiseStats.completedCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Date Filters */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={setTodayFilter}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStartDate === getTodayDate() && filterEndDate === getTodayDate()
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Today
          </button>
          <button
            onClick={setYesterdayFilter}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStartDate === getYesterdayDate() && filterEndDate === getYesterdayDate()
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Yesterday
          </button>
        </div>
      </div> */}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm font-medium ${
                showFilters || hasActiveFilters()
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters() && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {
                    [
                      filterRole !== "all",
                      filterStatus !== "all",
                      filterStartDate,
                      filterEndDate,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filters Section */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Name
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Users</option>
                  {uniqueUserNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {hasActiveFilters() && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Login Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logout Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {hasActiveFilters()
                      ? "No logs match your filters"
                      : "No login logs found"}
                  </td>
                </tr>
              ) : (
                currentItems.map((log, index) => (
                  <tr
                    key={log.id || `log-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {log.userName?.charAt(0).toUpperCase() ||
                              log.email?.charAt(0).toUpperCase() ||
                              "?"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {log.userName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {log.role?.toUpperCase() || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.loginTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.logoutTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatSessionDuration(log.sessionDuration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === "active"
                            ? "bg-green-100 text-green-800"
                            : log.status === "auto-completed"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.status === "active"
                          ? "Active"
                          : log.status === "auto-completed"
                            ? "Auto-Completed"
                            : "Completed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{currentItems.length}</span>{" "}
                  logs from{" "}
                  <span className="font-medium">
                    {currentDate
                      ? new Date(currentDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>{" "}
                  (Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>)
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {getPageNumbers().map((pageNumber, index) =>
                    pageNumber === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
