import { Link, useNavigate } from 'react-router-dom';
import { SERVICE_NAMES, COUNTRY_NAMES } from '../../types/project';
import { getStatusColor, getServiceColor } from '../../lib/projectUtils';
import { useProjects } from '../../context/ProjectContext';
import { Calendar, User, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../Components/ui/dropdown-menu';

export function ProjectList({ projects }) {
  const { teamMembers } = useProjects();
  const navigate = useNavigate();

  const getTeamMemberName = (id) => {
    const member = teamMembers.find(m => m.id === id);
    return member?.name || 'Unassigned';
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleEdit = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/projects/edit/${projectId}`);
  };

  const handleDuplicate = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement duplicate logic here
    console.log('Duplicate project:', projectId);
  };

  const handleDelete = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement delete logic here
    console.log('Delete project:', projectId);
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
        <p className="text-muted-foreground">No projects found</p>
        <Link to="/admin/projects/new">
          <Button className="mt-4" size="sm">
            Create New Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/30 px-6 py-3 text-sm font-medium text-muted-foreground text-start">
        <div className="col-span-4">Project</div>
        <div className="col-span-2">Service</div>
        <div className="col-span-2">Assigned To</div>
        <div className="col-span-2">Updated</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1"></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border text-start">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/admin/projects/${project.id}`}
            className="grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
          >
            <div className="col-span-4 space-y-1">
              <div className="font-mono text-sm font-medium text-foreground">
                {project.projectId}
              </div>
              <div className="text-sm text-muted-foreground">
                {project.clientName} • {COUNTRY_NAMES[project.country]}
              </div>
            </div>

            <div className="col-span-2">
              <span className={cn('service-badge', getServiceColor(project.serviceType))}>
                {SERVICE_NAMES[project.serviceType]}
              </span>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {getTeamMemberName(project.assignedTo)}
              </span>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDate(project.updatedAt)}
              </span>
            </div>

            <div className="col-span-1">
              <span className={cn('status-badge', getStatusColor(project.status))}>
                {project.status}
              </span>
            </div>

            <div className="col-span-1 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => handleEdit(e, project.id)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleDuplicate(e, project.id)}>
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => handleDelete(e, project.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}