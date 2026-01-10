import { Link, useNavigate } from 'react-router-dom';
import { SERVICE_NAMES, COUNTRY_NAMES } from '../../types/project';
import { getStatusColor, getServiceColor } from '../../lib/projectUtils';
import { useProjects } from '../../context/ProjectContext';
import { Calendar, User, MoreHorizontal, Trash2, Copy, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export function ProjectList({ projects }) {
  const { teamMembers, deleteProject, addProject } = useProjects();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // ✅ Check user role from localStorage
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

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

  // ✅ Edit - Both User & Admin can edit
  const handleEdit = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/projects/edit/${projectId}`);
  };

  // ✅ Duplicate - Both User & Admin can duplicate
  const handleDuplicate = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const projectToDuplicate = projects.find(p => p.id === projectId);
    
    if (!projectToDuplicate) {
      toast.error('Project not found');
      return;
    }

    const duplicatedProject = {
      ...projectToDuplicate,
      projectId: projectToDuplicate.projectId + '-COPY',
      status: 'Draft',
    };

    // Remove Firebase IDs before duplicating
    delete duplicatedProject.id;
    delete duplicatedProject.createdAt;
    delete duplicatedProject.updatedAt;

    addProject(duplicatedProject);
  };

  // ✅ Delete - Only Admin can delete
  const handleDeleteClick = (e, project) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAdmin) {
      toast.error('Only admins can delete projects');
      return;
    }

    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      setDeleteDialogOpen(false);
    }
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
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/30 px-6 py-3 text-sm font-medium text-muted-foreground text-start">
          <div className="col-span-2">Project</div>
          <div className="col-span-2">Start & End Time</div>
          <div className="col-span-2">Service</div>
          <div className="col-span-2">Assigned To</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1"></div>
        </div>

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
                    {/* ✅ Edit - Available for both User & Admin */}
                    <DropdownMenuItem onClick={(e) => handleEdit(e, project.id)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>

                    {/* ✅ Duplicate - Available for both User & Admin */}
                    <DropdownMenuItem onClick={(e) => handleDuplicate(e, project.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>

                    {/* ✅ Delete - Only for Admin */}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => handleDeleteClick(e, project)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project{' '}
              <span className="font-semibold text-foreground">
                {projectToDelete?.projectId}
              </span>{' '}
              for {projectToDelete?.clientName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}