// src/Pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  LogOut,
  Download,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  Calendar,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchSubmissions();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "erpSubmissions"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const submissionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      setSubmissions(submissionsData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert("Failed to load submissions. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // if (!window.confirm("Are you sure you want to logout?")) return;

    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  //   const handleDelete = async (id) => {
  //     if (!window.confirm("Are you sure you want to delete this submission? This cannot be undone.")) {
  //       return;
  //     }

  //     try {
  //       await deleteDoc(doc(db, "erpSubmissions", id));
  //       setSubmissions(submissions.filter(sub => sub.id !== id));
  //       alert("Submission deleted successfully");
  //     } catch (error) {
  //       console.error("Error deleting submission:", error);
  //       alert("Failed to delete submission");
  //     }
  //   };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "erpSubmissions", id));
      setSubmissions(submissions.filter((sub) => sub.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission");
    }
  };
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "erpSubmissions", id), {
        leadStatus: newStatus,
        updatedAt: new Date(),
      });

      setSubmissions(
        submissions.map((sub) =>
          sub.id === id ? { ...sub, leadStatus: newStatus } : sub
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const generatePDF = (formData) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;
    const lineHeight = 6;
    const pageHeight = 280;
    const leftMargin = 20;
    const rightMargin = 190;

    const checkPageBreak = (spaceNeeded = 10) => {
      if (y + spaceNeeded > pageHeight) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    const addWrappedText = (text, isBold = false) => {
      if (!text || text === "undefined" || text === "null") text = "N/A";
      const lines = doc.splitTextToSize(String(text), rightMargin - leftMargin);
      lines.forEach((line) => {
        checkPageBreak(lineHeight);
        doc.setFont(undefined, isBold ? "bold" : "normal");
        doc.text(line, leftMargin, y);
        y += lineHeight;
      });
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Date: ${dateStr}`, 200, 15, { align: "right" });
    doc.text(`Time: ${timeStr}`, 200, 20, { align: "right" });
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("ERP Customer Requirement Capture", 105, y, { align: "center" });
    y += 15;

    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Stage 1: Basic Inquiry Details", leftMargin, y);
    y += 10;

    doc.setFontSize(10);
    addWrappedText(`Company Name: ${formData.companyName || "N/A"}`);
    addWrappedText(`Plant Locations: ${formData.plantLocations || "N/A"}`);
    addWrappedText(`Industry Type: ${formData.industryType || "N/A"}`);
    addWrappedText(
      `Contact Person: ${formData.contactPerson || "N/A"} (${
        formData.designation || "N/A"
      })`
    );
    addWrappedText(`Phone: ${formData.phone || "N/A"}`);
    addWrappedText(`Email: ${formData.email || "N/A"}`);
    addWrappedText(
      `Manufacturing Type: ${formData.manufacturingType?.join(", ") || "N/A"}`
    );
    addWrappedText(`Number of Machines: ${formData.numberOfMachines || "N/A"}`);
    addWrappedText(`Number of Shifts: ${formData.numberOfShifts || "N/A"}`);
    addWrappedText(`Approx. Manpower: ${formData.approxManpower || "N/A"}`);
    y += 8;

    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Stage 2: Current System & Pain Points", leftMargin, y);
    y += 10;

    doc.setFontSize(10);
    addWrappedText(
      `Current System: ${formData.currentSystem?.join(", ") || "N/A"}`
    );

    if (formData.otherERP) {
      addWrappedText(`ERP Name: ${formData.otherERP}`);
    }

    addWrappedText(`Pain Points: ${formData.painPoints?.join(", ") || "N/A"}`);

    if (formData.otherPainPoint) {
      addWrappedText(`Other Pain Points: ${formData.otherPainPoint}`);
    }
    y += 8;

    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Stage 3: Module Requirements", leftMargin, y);
    y += 10;

    doc.setFontSize(10);
    addWrappedText(
      `Job Cards Required: ${formData.productionJobCards || "N/A"}`
    );
    addWrappedText(`Production Type: ${formData.productionType || "N/A"}`);
    addWrappedText(
      `Rejection Tracking: ${formData.rejectionTracking || "N/A"}`
    );
    addWrappedText(
      `Raw Material Tracking: ${formData.rawMaterialTracking || "N/A"}`
    );
    addWrappedText(`Barcode Required: ${formData.barcodeRequired || "N/A"}`);
    addWrappedText(`Lot/Batch Tracking: ${formData.lotTracking || "N/A"}`);
    addWrappedText(`Order Tracking: ${formData.orderTracking || "N/A"}`);
    addWrappedText(`Delivery Schedule: ${formData.deliverySchedule || "N/A"}`);
    addWrappedText(
      `Invoice Integration: ${formData.invoiceIntegration || "N/A"}`
    );

    const reports = [
      formData.dailyReport && "Daily Report",
      formData.shiftReport && "Shift Report",
      formData.machineEfficiency && "Machine Efficiency",
      formData.dashboard && "Dashboard",
    ]
      .filter(Boolean)
      .join(", ");
    addWrappedText(`Reports Required: ${reports || "None"}`);
    y += 8;

    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Stage 4: Commercial & Customization", leftMargin, y);
    y += 10;

    doc.setFontSize(10);
    addWrappedText(`Number of Users: ${formData.numberOfUsers || "N/A"}`);
    addWrappedText(`Number of Plants: ${formData.numberOfPlants || "N/A"}`);
    addWrappedText(`Deployment Preference: ${formData.deployment || "N/A"}`);

    if (formData.customFeatures && formData.customFeatures.trim() !== "") {
      checkPageBreak(20);
      doc.setFont(undefined, "bold");
      doc.text("Custom Features:", leftMargin, y);
      y += lineHeight;
      doc.setFont(undefined, "normal");
      addWrappedText(formData.customFeatures);
    }

    addWrappedText(`Go-Live Timeline: ${formData.goLiveTimeline || "N/A"}`);
    addWrappedText(`Lead Status: ${formData.leadStatus || "N/A"}`);
    addWrappedText(`Priority: ${formData.priority || "N/A"}`);

    y += 10;
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont(undefined, "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Generated by ERP Form System", leftMargin, y);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin, y + 5);

    return doc;
  };

  const downloadPDF = (submission) => {
    const doc = generatePDF(submission);
    doc.save(`${submission.companyName || "customer"}_ERP_requirements.pdf`);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || sub.leadStatus === filterStatus;

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const subDate = new Date(sub.createdAt);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && subDate >= fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && subDate <= toDate;
      }
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, dateFrom, dateTo]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "bg-blue-500/20 text-blue-400 border-blue-500",
      "Demo Done": "bg-purple-500/20 text-purple-400 border-purple-500",
      "Proposal Sent": "bg-yellow-500/5 text-yellow-400 border-yellow-500",
      Negotiation: "bg-orange-500/20 text-orange-400 border-orange-500",
      "Closed Won": "bg-green-500/20 text-green-400 border-green-500",
      "Closed Lost": "bg-red-500/20 text-red-400 border-red-500",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: "bg-red-500/20 text-red-400",
      Medium: "bg-yellow-500/20 text-yellow-400",
      Low: "bg-green-500/20 text-green-400",
    };
    return colors[priority] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-primary/10 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto  py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary font-Bai_Jamjuree">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400">ERP Submissions Management</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-white text-[#1168B5] font-bold rounded-lg hover:scale-95 transition-all duration-300 "
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto  py-10">
        {/* Filters and Search */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-primary/20">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by company, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className=" text-gray-400 mb-1 block">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border text-lg border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className=" text-gray-400 mb-1 block">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 text-lg border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className=" text-gray-400 mb-1 block">
                  Status Filter
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="New">New</option>
                  <option value="Demo Done">Demo Done</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchSubmissions}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-7 py-2.5 bg-gradient-to-r from-primary to-white text-lg text-[#1168B5] rounded-lg hover:bg-primary/80 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-4 md:mt-0"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 gap-y-1 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span>
                Total Submissions:{" "}
                <span className="text-primary font-bold">
                  {submissions.length}
                </span>
              </span>
              <span>
                Filtered:{" "}
                <span className="text-primary font-bold">
                  {filteredSubmissions.length}
                </span>
              </span>
            </div>
            <span className="text-xs">
              Last updated:{" "}
              {lastRefresh.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
              <span className="ml-2 text-green-400">
                ● Auto-refresh enabled
              </span>
            </span>
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading submissions...</p>
            </div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-md rounded-lg p-12 text-center border border-primary/20">
            <p className="text-gray-400 text-lg">No submissions found</p>
            {searchTerm && (
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Submissions Grid - One per row */}
            <div className="space-y-4">
              {currentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-gray-900/50 backdrop-blur-md rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Section - Company Info */}
                    <div className="lg:col-span-4">
                      <div className="flex flex-col-reverse  justify-between items-center mb-3">
                        <div className="flex-1 ">
                          <h3 className="text-xl font-bold text-primary mb-1 font-Bai_Jamjuree">
                            {submission.companyName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {submission.industryType ||
                              "Industry not specified"}
                          </p>
                        </div>
                        <div className="flex-1 flex w-full mr-0  justify-end">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-block  ${getPriorityColor(
                              submission.priority
                            )}`}
                          >
                            {submission.priority}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <User className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="truncate">
                            {submission.contactPerson} -{" "}
                            {submission.designation || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{submission.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="truncate">{submission.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDate(submission.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Details */}
                    <div className="lg:col-span-5">
                      <div className="mb-4">
                        <label className=" text-gray-400 mb-1 block">
                          Lead Status
                        </label>
                        <select
                          value={submission.leadStatus}
                          onChange={(e) =>
                            handleStatusUpdate(submission.id, e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded-lg text-sm font-bold border text-white bg-gray-700/40 cursor-pointer`}
                          // ${getStatusColor(
                          //   submission.leadStatus
                          // )}
                        >
                          <option value="New">New</option>
                          <option value="Demo Done">Demo Done</option>
                          <option value="Proposal Sent">Proposal Sent</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Closed Lost">Closed Lost</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-primary/50 rounded p-2">
                          <p className="text-white/80 text-sm">Timeline</p>
                          <p className="text-white font-bold truncate">
                            {submission.goLiveTimeline || "N/A"}
                          </p>
                        </div>
                        <div className="bg-primary/50 rounded p-2">
                          <p className="text-white/80 text-sm">Deployment</p>
                          <p className="text-white font-bold truncate">
                            {submission.deployment || "N/A"}
                          </p>
                        </div>
                        {/* <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400 text-xs">Users</p>
                          <p className="text-white font-bold truncate">
                            {submission.numberOfUsers || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400 text-xs">Plants</p>
                          <p className="text-white font-bold truncate">
                            {submission.numberOfPlants || "N/A"}
                          </p>
                        </div> */}
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="lg:col-span-3 flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-white text-[#1168B5] rounded-lg hover:scale-95 transition-all duration-300 font-bold text-xl"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View Details</span>
                      </button>
                      <button
                        onClick={() => downloadPDF(submission)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/30 to-white/30 text-white rounded-lg transition-all duration-300 font-bold border border-primary/50 hover:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download PDF</span>
                      </button>
                      <button
                        // onClick={() => handleDelete(submission.id)}
                        onClick={() => setDeleteConfirm(submission)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-white/10 text-white rounded-lg transition-all duration-300 font-bold border border-primary/50 hover:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {deleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white/5 backdrop-blur-lg rounded-lg max-w-md w-full  border-red-500/50 shadow-2xl">
                    <div className="p-6">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mx-auto mb-4">
                        <Trash2 className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white text-center mb-2 font-Bai_Jamjuree">
                        Delete Submission
                      </h3>
                      <p className="text-gray-400 text-center mb-6">
                        Are you sure you want to delete submission from{" "}
                        <span className="text-primary font-bold">
                          {deleteConfirm.companyName}
                        </span>
                        ?
                        <br />
                        <span className="text-red-400 text-sm">
                          This cannot be undone.
                        </span>
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(deleteConfirm.id)}
                          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 font-bold ${
                            currentPage === pageNum
                              ? "bg-primary text-black"
                              : "bg-gray-800 text-white hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Page Info */}
            <div className="mt-4 text-center text-sm text-gray-400">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredSubmissions.length)} of{" "}
              {filteredSubmissions.length} submissions
            </div>
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full my-8 border border-primary/20">
            <div className="sticky top-0 bg-gray-900 border-b border-primary/20 px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold text-primary font-Bai_Jamjuree">
                {selectedSubmission.companyName}
              </h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Stage 1: Basic Information */}
              <div className="border-l-4 border-primary bg-gradient-to-r from-primary/30 to-transparent py-5 pl-6">
                <h3 className="text-lg font-bold text-primary mb-3 font-Bai_Jamjuree">
                  Stage 1: Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-sm text-start">
                  <div>
                    <span className="text-gray-300">Company :</span>{" "}
                    <span className="text-white font-bold">
                      {selectedSubmission.companyName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Industry :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.industryType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Contact :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.contactPerson}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Designation:</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.designation}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Phone :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Email :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Plant Locations :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.plantLocations}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Manufacturing Type :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.manufacturingType?.join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Machines :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.numberOfMachines}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Shifts :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.numberOfShifts}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-300">Manpower :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.approxManpower}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 2: Pain Points */}
              <div className="border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-500/30 to-transparent py-5 pl-4">
                <h3 className="text-lg font-bold text-yellow-500 mb-3 font-Bai_Jamjuree">
                  Stage 2: Current System & Pain Points
                </h3>
                <div className="space-y-2 text-sm text-start">
                  <div>
                    <span className="text-gray-300">Current System :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.currentSystem?.join(", ")}
                    </span>
                  </div>
                  {selectedSubmission.otherERP && (
                    <div>
                      <span className="text-gray-300">ERP Name :</span>{" "}
                      <span className="text-white">
                        {selectedSubmission.otherERP}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-300">Pain Points :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.painPoints?.join(", ")}
                    </span>
                  </div>
                  {selectedSubmission.otherPainPoint && (
                    <div>
                      <span className="text-gray-300">Other Pain Points :</span>{" "}
                      <span className="text-white">
                        {selectedSubmission.otherPainPoint}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage 3: Module Requirements */}
              <div className="border-l-4 border-green-500 py-5 pl-4 bg-gradient-to-r from-green-500/30 to-transparent">
                <h3 className="text-lg font-bold text-green-500 mb-3 font-Bai_Jamjuree">
                  Stage 3: Module Requirements
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-start">
                  <div>
                    <span className="text-gray-300">Job Cards :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.productionJobCards}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Production Type :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.productionType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Rejection Tracking :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.rejectionTracking}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">
                      Raw Material Tracking :
                    </span>{" "}
                    <span className="text-white">
                      {selectedSubmission.rawMaterialTracking}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Barcode :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.barcodeRequired}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Lot Tracking :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.lotTracking}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Order Tracking :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.orderTracking}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Delivery Schedule :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.deliverySchedule}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-300">Invoice Integration :</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.invoiceIntegration}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-300">Reports :</span>
                    <span className="text-white ml-2">
                      {[
                        selectedSubmission.dailyReport && "Daily",
                        selectedSubmission.shiftReport && "Shift",
                        selectedSubmission.machineEfficiency &&
                          "Machine Efficiency",
                        selectedSubmission.dashboard && "Dashboard",
                      ]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 4: Commercial */}
              <div className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/30 to-transparent pl-4 py-5">
                <h3 className="text-lg font-bold text-blue-500 mb-3 font-Bai_Jamjuree">
                  Stage 4: Commercial Details
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-start">
                  <div>
                    <span className="text-gray-300">Users:</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.numberOfUsers}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Plants:</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.numberOfPlants}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Deployment:</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.deployment}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Go-Live:</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.goLiveTimeline}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Status:</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.leadStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Priority:</span>{" "}
                    <span className="text-white">
                      {selectedSubmission.priority}
                    </span>
                  </div>
                  {selectedSubmission.customFeatures && (
                    <div className="">
                      <span className="text-gray-300">Custom Features:</span>
                      <p className="text-white mt-1">
                        {selectedSubmission.customFeatures}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-primary/20 p-6">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary  to-white text-secondary rounded-lg hover:bg-gray-700 transition-all duration-300 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
