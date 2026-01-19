import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { SERVICE_NAMES, COUNTRY_NAMES } from "../../types/project";
import { getStatusColor, getServiceColor } from "../../lib/projectUtils";
import { useProjects } from "../../context/ProjectContext";
import {
  Calendar,
  User,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit2,
  Clock,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
const ITEMS_PER_PAGE = 10;

export function ProjectList({ projects }) {
  // ✅ CHANGED: Now using getTeamMemberName from context
  const { deleteProject, addProject, getTeamMemberName } = useProjects();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole"));
  const [userDepartment, setUserDepartment] = useState(() => localStorage.getItem("userDepartment"));
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem("userId"));
  const isAdmin = userRole === "admin";
  const serviceFilter = searchParams.get("service");


  
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const dept = localStorage.getItem("userDepartment");
    const userId = localStorage.getItem("userId");
    setUserRole(role);
    setUserDepartment(dept);
    setCurrentUserId(userId);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem("userRole");
      const dept = localStorage.getItem("userDepartment");
      const userId = localStorage.getItem("userId");
      setUserRole(role);
      setUserDepartment(dept);
      setCurrentUserId(userId);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const filteredProjects = useMemo(() => {
    if (serviceFilter) {
      return projects.filter((p) => p.serviceType === serviceFilter);
    }
    if (location.pathname === "/admin/projects") {
      return projects;
    }
    if (userRole === "admin") {
      return projects;
    }
    if (userDepartment === "Graphic Design" || userDepartment === "Content Writing") {
      return projects.filter((p) => p.serviceType === "GD" || p.serviceType === "CW");
    }
    if (userDepartment === "Front-End Developer" || userDepartment === "Website") {
      return projects.filter((p) => p.serviceType === "WD");
    }
    if (userDepartment === "ERP") {
      return projects.filter((p) => p.serviceType === "ERP");
    }

    return projects;
  }, [projects, userRole, userDepartment, serviceFilter, location.pathname]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [serviceFilter, projects.length]);

  // const getTeamMemberName = (id) => {
  //   debugger;
  //   if (!id) return "Unassigned";
  //   let member = teamMembers.find((m) => m.id === id);
  //   if (!member) {
  //     member = teamMembers.find((m) => m.email === id);
  //   }
  //   return member?.name || "Unassigned";
  // };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  // Check if user has an active task for this project
  const hasActiveTask = (project) => {
    if (!project.userTasks || !currentUserId) return false;
    const userTask = project.userTasks.find(task => task.userId === currentUserId);
    // Check if user has an active task (in_progress or paused)
    return userTask && (userTask.taskStatus === 'in_progress' || userTask.taskStatus === 'paused');
  };

  const handleProjectClick = (e, project) => {
    e.preventDefault();

    // Check if user has an active task
    if (hasActiveTask(project)) {
      // Navigate to edit mode if user has active task
      navigate(`/admin/projects/edit/${project.id}`);
    } else {
      // Navigate to detail view if no active task
      navigate(`/admin/projects/${project.id}`);
    }
  };

  const handleEdit = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/projects/edit/${projectId}`);
  };

  const handleDuplicate = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    const projectToDuplicate = filteredProjects.find((p) => p.id === projectId);
    if (!projectToDuplicate) {
      toast.error("Project not found");
      return;
    }
    const duplicatedProject = {
      ...projectToDuplicate,
      projectId: projectToDuplicate.projectId + "-COPY",
      status: "Draft",
      userTasks: [], // Reset user tasks for duplicated project
    };
    delete duplicatedProject.id;
    delete duplicatedProject.createdAt;
    delete duplicatedProject.updatedAt;
    addProject(duplicatedProject);
    toast.success("Project duplicated successfully!");
  };

  const handleDeleteClick = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAdmin) {
      toast.error("Only admins can delete projects");
      return;
    }
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id);
        toast.success(`Project ${projectToDelete.projectId} deleted successfully!`);
        setProjectToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  const calculateTotalTime = (startTime, endTime) => {
    if (!startTime || !endTime) return "--:--";
    try {
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      const startMinutes = parseTime(startTime);
      const endMinutes = parseTime(endTime);
      let diffMinutes = endMinutes - startMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return "--:--";
    }
  };

  // Get user's task status badge
  const getUserTaskStatus = (project) => {
    if (!project.userTasks || !currentUserId) return null;
    const userTask = project.userTasks.find(task => task.userId === currentUserId);
    if (!userTask) return null;

    const statusColors = {
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'paused': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'completed': 'bg-green-100 text-green-800 border-green-300'
    };

    const statusLabels = {
      'in_progress': 'In Progress',
      'paused': 'Paused',
      'completed': 'Completed'
    };

    return (
      <span className={cn(
        "px-2 py-1 rounded-full text-xs font-medium border",
        statusColors[userTask.taskStatus] || 'bg-gray-100 text-gray-800 border-gray-300'
      )}>
        {statusLabels[userTask.taskStatus] || userTask.taskStatus}
      </span>
    );
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 px-8">
        <p className="text-muted-foreground mb-4">No projects found</p>
        {isAdmin && (
          <Link to="/admin/projects/new">
            <Button className="mt-4" size="sm">
              Create New Project
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto table-scroll-container">
          <div className="min-w-[1400px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_2fr_2fr_2fr_1fr_1fr_1fr] gap-4 border-b border-border text-start bg-muted/30 px-6 py-3 text-sm font-medium text-muted-foreground">
              <div>Project</div>
              <div>Start Time</div>
              <div>End Time</div>
              <div>Total Time</div>
              <div>Service</div>
              <div>Assigned To</div>
              <div>Updated</div>
              <div>Status</div>
              <div className="text-end">More</div>
            </div>

            <div className="divide-y divide-border">
              {paginatedProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={(e) => handleProjectClick(e, project)}
                  className="grid grid-cols-[2fr_1fr_1fr_2fr_2fr_2fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 hover:bg-muted/30 text-start cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="font-mono text-sm font-medium flex items-center gap-2">
                      {project.projectId}
                      {hasActiveTask(project) && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {project.clientName} • {COUNTRY_NAMES[project.country]}
                    </div>
                    {getUserTaskStatus(project) && (
                      <div className="mt-1">
                        {getUserTaskStatus(project)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {project.startTime || "--:--"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {project.endTime || "--:--"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {calculateTotalTime(project.startTime, project.endTime)}
                    </span>
                  </div>

                  <div>
                    <span
                      className={cn(
                        "service-badge",
                        getServiceColor(project.serviceType)
                      )}
                    >
                      {SERVICE_NAMES[project.serviceType]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">
                      {getTeamMemberName(project.assignedTo)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>

                  <div>
                    <span
                      className={cn(
                        "status-badge",
                        getStatusColor(project.status)
                      )}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleEdit(e, project.id)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => handleDuplicate(e, project.id)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>

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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project{" "}
              <strong className="text-foreground">{projectToDelete?.projectId}</strong> and remove all its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}