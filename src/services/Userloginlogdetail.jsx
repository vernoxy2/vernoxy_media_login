// src/Pages/Admin/UserLoginLogDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLoginLogById, formatSessionDuration } from "../services/loginLogService";
import {
  ArrowLeft, LogIn, LogOut, Clock,
  Mail, Building2, Calendar,
  AlertCircle, CheckCircle2, Timer,
} from "lucide-react";

export default function UserLoginLogDetail({ log: propLog, onBack }) {
  const { logId }   = useParams();
  const navigate    = useNavigate();
  const [log, setLog]         = useState(propLog || null);
  const [loading, setLoading] = useState(!propLog);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (propLog) {
      setLog({
        ...propLog,
        timeLog: [...(propLog.timeLog || [])].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        ),
      });
      return;
    }
    if (logId) fetchLog();
  }, [logId, propLog]);

  const fetchLog = async () => {
    try {
      setLoading(true);
      const data = await getLoginLogById(logId);
      if (!data) { setError("Log not found."); return; }
      setLog(data);
    } catch {
      setError("Failed to load log details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => { if (onBack) onBack(); else navigate(-1); };

  const fmt = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    }).format(new Date(date));
  };

  const fmtDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };

  // Total work = sum of (logout - login) for each matched pair
  const totalWorkSeconds = () => {
    if (!log?.timeLog) return null;
    const sorted = [...log.timeLog].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    let total = 0, lastLogin = null;
    sorted.forEach((e) => {
      if (e.type === "login") {
        lastLogin = new Date(e.timestamp);
      } else if (e.type === "logout" && lastLogin) {
        total += (new Date(e.timestamp) - lastLogin) / 1000;
        lastLogin = null;
      }
    });
    return total > 0 ? total : null;
  };

  const getEntryStyle = (type) => {
    if (type === "login") return {
      dot:        "bg-emerald-500 ring-4 ring-emerald-100",
      card:       "bg-emerald-50 border-emerald-200",
      icon:       <LogIn  className="w-4 h-4 text-emerald-600" />,
      label:      "Login",
      labelColor: "text-emerald-700 bg-emerald-100",
      timeColor:  "text-emerald-800",
    };
    if (type === "logout") return {
      dot:        "bg-sky-500 ring-4 ring-sky-100",
      card:       "bg-sky-50 border-sky-200",
      icon:       <LogOut className="w-4 h-4 text-sky-600" />,
      label:      "Logout",
      labelColor: "text-sky-700 bg-sky-100",
      timeColor:  "text-sky-800",
    };
    // fallback
    return {
      dot:        "bg-gray-400 ring-4 ring-gray-100",
      card:       "bg-gray-50 border-gray-200",
      icon:       <Clock  className="w-4 h-4 text-gray-500" />,
      label:      type,
      labelColor: "text-gray-600 bg-gray-100",
      timeColor:  "text-gray-700",
    };
  };

  const getStatusBadge = (status) => {
    if (status === "active") return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
    if (status === "completed") return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-sky-100 text-sky-800 border border-sky-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Completed
      </span>
    );
    return null;
  };

  // ── Loading / Error ────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading details...</p>
      </div>
    </div>
  );

  if (error || !log) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600">{error || "No data found."}</p>
        <button onClick={handleBack} className="mt-4 text-blue-600 hover:underline text-sm">← Go Back</button>
      </div>
    </div>
  );

  // Only show login & logout entries (no auto-logout)
  const timeLog      = [...(log.timeLog || [])]
    .filter(e => e.type === "login" || e.type === "logout")
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const totalWork    = totalWorkSeconds();
  const sessionCount = timeLog.filter(e => e.type === "login").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Login Logs
        </button>

        {/* User Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">
                  {log.userName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{log.userName || "N/A"}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Mail className="w-3 h-3" />{log.email || "N/A"}
                  </span>
                  {log.department && log.department !== "N/A" && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Building2 className="w-3 h-3" />{log.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(log.status)}
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${log.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                {log.role?.toUpperCase() || "USER"}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">{fmtDate(log.date)}</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">First In</p>
            <p className="text-base font-bold text-emerald-700">{fmt(log.loginTime)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Last Out</p>
            <p className={`text-base font-bold ${log.logoutTime ? "text-sky-700" : "text-gray-400"}`}>
              {log.logoutTime ? fmt(log.logoutTime) : "—"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Total Work</p>
            <p className="text-base font-bold text-indigo-700">
              {totalWork ? formatSessionDuration(Math.floor(totalWork)) : "—"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Sessions</p>
            <p className="text-base font-bold text-gray-700">{sessionCount}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-500" />
              Full Day Activity
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{timeLog.length} events recorded</p>
          </div>

          {timeLog.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No activity recorded
            </div>
          ) : (
            <div className="px-6 py-5">
              <div className="relative">
                <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-200" />
                <div className="space-y-4">
                  {timeLog.map((entry, index) => {
                    const style = getEntryStyle(entry.type);
                    return (
                      <div key={index} className="flex items-start gap-4 relative">
                        <div className={`relative z-10 w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${style.dot}`}>
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        </div>
                        <div className={`flex-1 rounded-xl border px-4 py-3 ${style.card}`}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              {style.icon}
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.labelColor}`}>
                                {style.label}
                              </span>
                            </div>
                            <span className={`text-sm font-bold tabular-nums ${style.timeColor}`}>
                              {fmt(entry.timestamp)}
                            </span>
                          </div>
                          {entry.type === "logout" && entry.sessionDuration && (
                            <div className="mt-1.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Session: {formatSessionDuration(entry.sessionDuration)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* If still active - show pending logout */}
                  {log.status === "active" && (
                    <div className="flex items-start gap-4 relative">
                      <div className="relative z-10 w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-300 ring-4 ring-gray-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                      <div className="flex-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-gray-500 bg-gray-200">
                            Logout Pending...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}