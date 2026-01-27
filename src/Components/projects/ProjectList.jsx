import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

export function ProjectList({ projects }) {
  const ITEMS_PER_PAGE = 10;
  const { deleteProject, addProject, getTeamMemberName } = useProjects();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [projectsData, setProjectsData] = useState([]);
  const [renderKey, setRenderKey] = useState(0);
  
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  const isAdmin = userRole === "admin";
  const serviceFilter = searchParams.get("service");

  useEffect(() => {
    if (projects && projects.length > 0) {
      setProjectsData([...projects]);
      setRenderKey(prev => prev + 1);
    }
  }, [projects, projects.length]);

  useEffect(() => {
    const loadUserData = () => {
      const role = localStorage.getItem("userRole");
      const dept = localStorage.getItem("userDepartment");
      const userId = localStorage.getItem("userId");
      
      setUserRole(role);
      setUserDepartment(dept);
      setCurrentUserId(userId);
      setIsDataLoaded(true);
    };

    loadUserData();
    const timeoutId = setTimeout(loadUserData, 100);

    return () => clearTimeout(timeoutId);
  }, [projects]);

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

  useEffect(() => {
    const hasActiveProjects = projectsData.some(project => {
      const userId = currentUserId || localStorage.getItem("userId");
      const userTask = project.userTasks?.find(task => task.userId === userId);
      return userTask && userTask.taskStatus === "in_progress";
    });

    if (!hasActiveProjects) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [projectsData, currentUserId]);

  const filteredProjects = useMemo(() => {
    let filtered = projectsData;

    if (serviceFilter) {
      filtered = filtered.filter((p) => p.serviceType === serviceFilter);
      return filtered;
    }

    if (userRole === "admin") {
      return projectsData;
    }
    if (
      userDepartment === "Graphic Design" ||
      userDepartment === "Content Writing"
    ) {
      filtered = projectsData.filter(
        (p) => p.serviceType === "GD" || p.serviceType === "CW",
      );
    } else if (
      userDepartment === "Front-End Developer" ||
      userDepartment === "Website"
    ) {
      filtered = projectsData.filter((p) => p.serviceType === "WD");
    } else if (userDepartment === "ERP") {
      filtered = projectsData.filter((p) => p.serviceType === "ERP");
    }

    return filtered;
  }, [projectsData, userRole, userDepartment, serviceFilter, renderKey]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [serviceFilter, projectsData.length]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getUserTask = (project) => {
    const userId = currentUserId || localStorage.getItem("userId");
    
    if (!userId) {
      return null;
    }
    
    if (!project.userTasks || project.userTasks.length === 0) {
      return null;
    }
    
    const userTask = project.userTasks.find(task => task.userId === userId);
    
    return userTask || null;
  };

  const hasActiveTask = (project) => {
    const userTask = getUserTask(project);
    return (
      userTask &&
      (userTask.taskStatus === "in_progress" ||
        userTask.taskStatus === "paused")
    );
  };

  // ✅ FIX: Only show estimated time if current user has their own userTask with estimated time
  const getEstimatedTime = (project) => {
    const userTask = getUserTask(project);
    
    // ✅ If no userTask for current user, show --:--
    if (!userTask) {
      return "--:--";
    }
    
    // ✅ Only show time if user has set their own estimated time
    if (!userTask.estimatedHours && !userTask.estimatedMinutes) {
      return "--:--";
    }
    
    const hoursStr = userTask.estimatedHours || "0";
    const minutesStr = userTask.estimatedMinutes || "0";
    
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    const h = isNaN(hours) ? 0 : hours;
    const m = isNaN(minutes) ? 0 : minutes;
    
    if (h === 0 && m === 0) {
      return "--:--";
    }
    
    return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  };

  const calculateTotalTime = (project) => {
    const userTask = getUserTask(project);
    
    if (!userTask || !userTask.timeLog || userTask.timeLog.length === 0) {
      return "--:--";
    }

    try {
      const timeLogs = userTask.timeLog;
      let totalMs = 0;
      let currentStartTime = null;

      const sortedLogs = [...timeLogs].sort((a, b) => {
        const dateA = new Date(a.dateTime || a.timestamp);
        const dateB = new Date(b.dateTime || b.timestamp);
        return dateA - dateB;
      });

      for (let i = 0; i < sortedLogs.length; i++) {
        const log = sortedLogs[i];
        
        if (log.type === "start" || log.type === "resume") {
          const startDate = new Date(log.dateTime || log.timestamp);
          
          if (isNaN(startDate.getTime())) {
            continue;
          }
          
          currentStartTime = startDate;
        } 
        else if (log.type === "pause" || log.type === "end") {
          if (currentStartTime) {
            const endDate = new Date(log.dateTime || log.timestamp);
            
            if (!isNaN(endDate.getTime())) {
              const sessionMs = endDate - currentStartTime;
              
              if (sessionMs > 0) {
                totalMs += sessionMs;
              }
            }
            
            currentStartTime = null;
          }
        }
      }
      
      if (currentStartTime && userTask.taskStatus === "in_progress") {
        const runningMs = currentTime - currentStartTime.getTime();
        
        if (runningMs > 0) {
          totalMs += runningMs;
        }
      }

      const totalMinutes = Math.floor(totalMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const displayHours = Math.max(0, hours);
      const displayMinutes = Math.max(0, minutes);

      return `${String(displayHours).padStart(2, "0")}h ${String(displayMinutes).padStart(2, "0")}m`;
    } catch (error) {
      return "--:--";
    }
  };

  const getStartTime = (project) => {
    const userTask = getUserTask(project);

    if (!userTask || !userTask.timeLog || userTask.timeLog.length === 0) {
      return { time: "--:--", date: "" };
    }

    const startLog = userTask.timeLog.find((log) => log.type === "start");
    if (!startLog) return { time: "--:--", date: "" };

    try {
      const dateString = startLog.dateTime || startLog.timestamp;
      if (!dateString) return { time: "--:--", date: "" };

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { time: "--:--", date: "" };

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);

      return {
        time: `${formattedHours}:${minutes} ${period}`,
        date: `${day}/${month}/${year}`,
      };
    } catch (error) {
      return { time: "--:--", date: "" };
    }
  };

  const getEndTime = (project) => {
    const userTask = getUserTask(project);
    
    if (!userTask || !userTask.timeLog || userTask.timeLog.length === 0) {
      return { time: "--:--", date: "" };
    }
    
    const endLog = userTask.timeLog.find((log) => log.type === "end");
    if (!endLog) return { time: "--:--", date: "" };

    try {
      const dateString = endLog.dateTime || endLog.timestamp;
      if (!dateString) return { time: "--:--", date: "" };

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { time: "--:--", date: "" };

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, "0");

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);

      return {
        time: `${formattedHours}:${minutes} ${period}`,
        date: `${day}/${month}/${year}`,
      };
    } catch (error) {
      return { time: "--:--", date: "" };
    }
  };

  const handleProjectClick = (e, project) => {
    e.preventDefault();

    if (hasActiveTask(project)) {
      navigate(`/admin/projects/edit/${project.id}`);
    } else {
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
      userTasks: [],
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
        toast.success(
          `Project ${projectToDelete.projectId} deleted successfully!`,
        );
        setProjectToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  const getUserTaskStatus = (project) => {
    const userTask = getUserTask(project);
    if (!userTask) return null;

    const statusColors = {
      in_progress: "bg-blue-100 text-blue-800 border-blue-300",
      paused: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
    };

    const statusLabels = {
      in_progress: "In Progress",
      paused: "Paused",
      completed: "Completed",
    };

    return (
      <span
        className={cn(
          "px-2 py-1 rounded-full text-xs font-medium border",
          statusColors[userTask.taskStatus] ||
            "bg-gray-100 text-gray-800 border-gray-300",
        )}
      >
        {statusLabels[userTask.taskStatus] || userTask.taskStatus}
      </span>
    );
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 px-8">
        <p className="text-muted-foreground mb-4">
          {!isDataLoaded 
            ? "Loading projects..." 
            : serviceFilter
            ? `No ${SERVICE_NAMES[serviceFilter]} projects found`
            : "No projects found"}
        </p>
        {isAdmin && isDataLoaded && (
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
      <div className="rounded-xl border border-border bg-card overflow-hidden" key={renderKey}>
        <div className="overflow-x-auto table-scroll-container">
          <div className="min-w-[1600px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr_1fr_1fr_0.5fr] gap-4 border-b border-border text-start bg-muted/30 px-6 py-3 text-sm font-medium text-muted-foreground">
              <div>Project</div>
              <div>Start Time</div>
              <div>End Time</div>
              <div>Estimate Time</div>
              <div>Total Time</div>
              <div>Service</div>
              <div>Assigned To</div>
              <div>Updated</div>
              <div>Status</div>
              <div className="text-end">More</div>
            </div>

            <div className="divide-y divide-border">
              {paginatedProjects.map((project) => {
                const startTime = getStartTime(project);
                const endTime = getEndTime(project);
                const totalTime = calculateTotalTime(project);
                const estimatedTime = getEstimatedTime(project);

                return (
                  <div
                    key={`${project.id}-${renderKey}`}
                    onClick={(e) => handleProjectClick(e, project)}
                    className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr_1fr_1fr_0.5fr] items-center gap-4 px-6 py-4 hover:bg-muted/30 text-start cursor-pointer"
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
                        <div className="mt-1">{getUserTaskStatus(project)}</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">
                          {startTime.time}
                        </span>
                      </div>
                      {startTime.date && (
                        <span className="text-[10px] text-muted-foreground pl-4">
                          {startTime.date}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">
                          {endTime.time}
                        </span>
                      </div>
                      {endTime.date && (
                        <span className="text-[10px] text-muted-foreground pl-4">
                          {endTime.date}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600">
                        {estimatedTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">
                        {totalTime}
                      </span>
                    </div>

                    <div>
                      <span
                        className={cn(
                          "service-badge",
                          getServiceColor(project.serviceType),
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
                          getStatusColor(project.status),
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
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
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {projectsData.length} projects
          {serviceFilter && ` (filtered by ${SERVICE_NAMES[serviceFilter]})`}
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
              This action cannot be undone. This will permanently delete the
              project{" "}
              <strong className="text-foreground">
                {projectToDelete?.projectId}
              </strong>{" "}
              and remove all its data from our servers.
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