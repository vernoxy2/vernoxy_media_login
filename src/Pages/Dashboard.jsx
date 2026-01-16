import { useProjects } from "../context/ProjectContext";
import { StatCard } from "../Components/dashboard/StatCard";
import { StatusBreakdown } from "../Components/dashboard/StatusBreakdown";
import { ServiceBreakdown } from "../Components/dashboard/ServiceBreakdown";
import { RecentProjects } from "../Components/dashboard/RecentProjects";
import { FolderKanban, Users, Clock, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { projects, teamMembers, currentUser } = useProjects();
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-foreground ">Dashboard</h1>
          <p className="text-muted-foreground ">
            Overview of your projects and team activity
          </p>
        </div>
        {/* set user records(name,email and role) */}
        <div className="flex justify-end items-start text-start">
          <UserInfoDisplay currentUser={currentUser} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <StatusBreakdown projects={projects} />
        <ServiceBreakdown projects={projects} />
      </div>

      {/* Recent Projects */}
      <RecentProjects projects={projects} />
    </div>
  );
}
