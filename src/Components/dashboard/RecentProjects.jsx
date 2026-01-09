import { Link } from 'react-router-dom';
import { SERVICE_NAMES, COUNTRY_NAMES } from '../../types/project';
import { getStatusColor, getServiceColor } from '../lib/projectUtils';
import { useProjects } from '../../context/ProjectContext';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function RecentProjects({ projects, limit = 5 }) {
  const { teamMembers } = useProjects();
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);

  const getTeamMemberName = (id) => {
    const member = teamMembers.find(m => m.id === id);
    return member?.name || 'Unassigned';
  };

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Projects</h3>
        <Link
          to="/projects"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {recentProjects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-foreground">
                  {project.projectId}
                </span>
                <span className={cn('service-badge', getServiceColor(project.serviceType))}>
                  {SERVICE_NAMES[project.serviceType]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {project.clientName} • {COUNTRY_NAMES[project.country]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {getTeamMemberName(project.assignedTo)}
              </span>
              <span className={cn('status-badge', getStatusColor(project.status))}>
                {project.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
