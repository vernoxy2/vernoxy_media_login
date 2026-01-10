import { useProjects } from '../context/ProjectContext';
import { StatCard } from '../Components/dashboard/StatCard';
import { StatusBreakdown } from "../Components/dashboard/StatusBreakdown"
import { ServiceBreakdown } from '../Components/dashboard/ServiceBreakdown';
import { RecentProjects } from '../Components/dashboard/RecentProjects';
import { FolderKanban, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { projects, teamMembers } = useProjects();

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    pendingReview: projects.filter(p => p.status === 'Review').length,
    delivered: projects.filter(p => p.status === 'Delivered').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2">
        <div className='text-start'>
        <h1 className="text-2xl font-bold text-foreground ">Dashboard</h1>
        <p className="text-muted-foreground ">Overview of your projects and team activity</p>
        </div>
        <div className='text-start'> 

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
