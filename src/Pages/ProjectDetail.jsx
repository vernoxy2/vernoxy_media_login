import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjects } from "../context/ProjectContext";
import { SERVICE_NAMES, COUNTRY_NAMES } from "../types/project";
import { getStatusColor, getServiceColor } from "../lib/projectUtils";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Separator } from "../Components/ui/separator";
import { Textarea } from "../Components/ui/textarea";
import { ArrowLeft, Calendar, User, Globe, Briefcase, Activity, Users, Clock, Play } from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById, teamMembers, updateProject } = useProjects();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  
  const [showEstimateTime, setShowEstimateTime] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState("0");
  const [estimatedMinutes, setEstimatedMinutes] = useState("0");
  
  const project = getProjectById(id || "");

  const currentUserEmail = localStorage.getItem("userEmail");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!project) return;

    if (project.notes) {
      setNotes(project.notes);
    }
    
    if (project.estimatedHours) {
      setEstimatedHours(project.estimatedHours);
    } else {
      setEstimatedHours("0");
    }
    
    if (project.estimatedMinutes) {
      setEstimatedMinutes(project.estimatedMinutes);
    } else {
      setEstimatedMinutes("0");
    }
    
    if (project.status === "Accepted" || project.status === "In Progress") {
      setShowEstimateTime(true);
    }
    
    const timerData = localStorage.getItem('activeTimer');
    if (timerData) {
      try {
        const { projectId, estimatedHours, estimatedMinutes } = JSON.parse(timerData);
        if (projectId === project.projectId) {
          setShowEstimateTime(true);
          if (!project.estimatedHours) {
            setEstimatedHours(estimatedHours);
          }
          if (!project.estimatedMinutes) {
            setEstimatedMinutes(estimatedMinutes);
          }
        }
      } catch (error) {
        console.log("Error checking timer:", error);
      }
    }
  }, [project]);

  useEffect(() => {
    if (currentUserEmail && project) {
      setShowButtons(true);
    } else {
      setShowButtons(false);
    }
  }, [currentUserEmail, project]);

  // Check if current user has an active task
  const hasActiveTask = () => {
    if (!project?.userTasks || !currentUserId) return false;
    const userTask = project.userTasks.find(task => task.userId === currentUserId);
    return userTask && (userTask.taskStatus === 'in_progress' || userTask.taskStatus === 'paused');
  };

  // Get current user's task
  const getCurrentUserTask = () => {
    if (!project?.userTasks || !currentUserId) return null;
    return project.userTasks.find(task => task.userId === currentUserId);
  };

  if (!project) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
        <p className="mb-4 text-muted-foreground">Project not found</p>
        <Link to="/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const assignedMember = teamMembers.find((m) => m.name === project.assignedTo);
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, "0");

    return `${formattedHours}:${minutes} ${period}`;
  };

  const handleAcceptClick = async () => {
    // If user has active task, redirect to edit mode
    if (hasActiveTask()) {
      navigate(`/admin/projects/edit/${id}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const currentTime = getCurrentTime();
      const currentDateTime = new Date().toISOString();

      // Get existing user tasks or initialize empty array
      const existingUserTasks = project.userTasks || [];

      // Create new user task entry
      const newUserTask = {
        userId: currentUserId,
        userEmail: currentUserEmail,
        userName: localStorage.getItem("userName") || currentUserEmail,
        taskStatus: 'in_progress',
        startTime: currentTime,
        endTime: null,
        timeLog: [
          {
            type: 'start',
            dateTime: currentDateTime,
            timestamp: currentTime
          }
        ]
      };

      const updateData = {
        status: "In Progress", // Project status
        isAccepted: true,
        acceptedAt: currentDateTime,
        updatedAt: currentDateTime,
        userTasks: [...existingUserTasks, newUserTask] // Add new user task
      };
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, updateData);
      await updateProject(id, updateData);

      toast.success("Project accepted! Redirecting to edit mode...");

      setTimeout(() => {
        navigate(`/admin/projects/edit/${id}`);
      }, 1000);
      setShowEstimateTime(true);
        } catch (error) {
      console.error("Error accepting project:", error);
      toast.error("Failed to accept project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ UPDATED: Start button - adds "Started at" to Activity
  const handleStartClick = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const hours = parseInt(estimatedHours) || 0;
    const minutes = parseInt(estimatedMinutes) || 0;

    if (hours === 0 && minutes === 0) {
      toast.error("Please set estimated time before starting!");
      return;
    }

    if (hours > 12) {
      toast.error("Hours should be between 0-12");
      return;
    }

    if (minutes > 60) {
      toast.error("Minutes should be between 0-60");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentTime = getCurrentTime();
      
      // ✅ UPDATE: Add startedAt timestamp for Activity section
      const updateData = {
        status: "In Progress",
        startWorkTime: currentTime, // Shows in Activity as "Started at"
        startedAt: new Date().toISOString(), // ISO timestamp for proper date formatting
        estimatedHours: estimatedHours,
        estimatedMinutes: estimatedMinutes,
        updatedAt: new Date().toISOString(),
      };
      
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, updateData);
      await updateProject(id, updateData);

      localStorage.setItem('activeTimer', JSON.stringify({
        projectId: project.projectId,
        estimatedHours,
        estimatedMinutes,
        startTime: new Date().toISOString()
      }));

      window.dispatchEvent(new CustomEvent('timerStart', {
        detail: { estimatedHours, estimatedMinutes }
      }));

      toast.success("Timer started! Status: In Progress");
    } catch (error) {
      console.error("Error starting timer:", error);
      toast.error("Failed to start timer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ UPDATED: Submit button - adds "Submitted at" to Activity
  const handleSubmitClick = async () => {
    setIsSubmitting(true);
    try {
      const currentTime = getCurrentTime();
      const currentDateTime = new Date().toISOString();

      // Get existing user tasks
      const existingUserTasks = project.userTasks || [];

      // Find and update current user's task
      const updatedUserTasks = existingUserTasks.map(task => {
        if (task.userId === currentUserId) {
          return {
            ...task,
            taskStatus: 'completed',
            endTime: currentTime,
            timeLog: [
              ...(task.timeLog || []),
              {
                type: 'end',
                dateTime: currentDateTime,
                timestamp: currentTime
              }
            ]
          };
        }
        return task;
      });

      const updateData = {
        status: "Done", // Project status
        updatedAt: currentDateTime,
        userTasks: updatedUserTasks
      };
      
      localStorage.removeItem('activeTimer');
      
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, updateData);
      await updateProject(id, updateData);

      toast.success("Project submitted successfully!");

      setTimeout(() => {
        navigate("/admin/projects");
      }, 1500);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to submit project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const userTask = getCurrentUserTask();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="items-center gap-3">
              <h1 className="font-mono text-2xl font-bold text-foreground">
                {project.projectId}
              </h1>
              {userTask && (
                <div className="mt-2">
                  <Badge className={cn(
                    userTask.taskStatus === 'in_progress' && 'bg-blue-500',
                    userTask.taskStatus === 'paused' && 'bg-yellow-500',
                    userTask.taskStatus === 'completed' && 'bg-green-500'
                  )}>
                    Your Task: {userTask.taskStatus === 'in_progress' ? 'In Progress' :
                      userTask.taskStatus === 'paused' ? 'Paused' : 'Completed'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {showButtons && project.serviceType === "GD" && (
          <div>
            {!hasActiveTask() && project.status === "Draft" && (
              <Button
                onClick={handleAcceptClick}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                {isSubmitting ? "Accepting..." : "Accept & Start"}
              </Button>
            )}

            {hasActiveTask() && (
              <Button
                onClick={() => navigate(`/admin/projects/edit/${id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue Working
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Project Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-3 text-start">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium text-foreground">
                    {project.clientName || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <Badge
                    className={cn(
                      "service-badge",
                      getServiceColor(project.serviceType)
                    )}
                  >
                    {SERVICE_NAMES[project.serviceType]}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={cn(
                      "status-badge",
                      getStatusColor(project.status)
                    )}
                  >
                    {project.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium text-foreground">
                    {COUNTRY_NAMES[project.country]}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium text-foreground">
                    {project.month} {project.year}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium text-foreground">
                    {assignedMember ? assignedMember.name : "Unassigned"}
                  </p>
                </div>
              </div>

              {project.estimatedHours && project.estimatedMinutes && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Time</p>
                    <p className="font-medium text-foreground">
                      {project.estimatedHours}h {project.estimatedMinutes}m
                    </p>
                  </div>
                </div>
              )}
            </div>

            {project.internalNotes && (
              <>
                <Separator className="my-4" />
                <div className="text-start">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Internal Notes
                  </p>
                  <p className="text-foreground">{project.internalNotes}</p>
                </div>
              </>
            )}
          </div>

          {project.serviceType === "GD" && project.graphicDesign && (
            <div className="rounded-xl border border-service-graphic/20 bg-service-graphic/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-service-graphic" />
                Graphic Design Details
              </h2>
              <div className="grid gap-4 md:grid-cols-3 text-start">
                <div>
                  <p className="text-sm text-muted-foreground">Post Type</p>
                  <p className="font-medium text-foreground">
                    {project.graphicDesign.postType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium text-foreground">
                    {project.graphicDesign.platform}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium text-foreground">
                    {project.graphicDesign.size}
                  </p>
                </div>
              </div>
              {project.graphicDesign.mainText && (
                <div className="mt-4 text-start">
                  <p className="text-sm text-muted-foreground">Main Text</p>
                  <p className="font-medium text-foreground">
                    {project.graphicDesign.mainText}
                  </p>
                </div>
              )}
              {project.graphicDesign.ctaText && (
                <div className="mt-4 text-start">
                  <p className="text-sm text-muted-foreground">CTA</p>
                  <p className="font-medium text-foreground">
                    {project.graphicDesign.ctaText}
                  </p>
                </div>
              )}
            </div>
          )}

          {project.serviceType === "WD" && project.websiteDesign && (
            <div className="rounded-xl border border-service-website/20 bg-service-website/5 p-6 text-start">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-service-website" />
                Website Design Details
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Website Type</p>
                  <p className="font-medium text-foreground">
                    {project.websiteDesign.websiteType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Number of Pages
                  </p>
                  <p className="font-medium text-foreground">
                    {project.websiteDesign.numberOfPages}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Technology</p>
                  <p className="font-medium text-foreground">
                    {project.websiteDesign.technologyPreference ||
                      "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {project.serviceType === "CW" && project.contentWriting && (
            <div className="rounded-xl border border-service-content/20 bg-service-content/5 p-6 text-start">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-service-content" />
                Content Writing Details
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Content Type</p>
                  <p className="font-medium text-foreground">
                    {project.contentWriting.contentType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Word Count</p>
                  <p className="font-medium text-foreground">
                    {project.contentWriting.wordCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tone</p>
                  <p className="font-medium text-foreground">
                    {project.contentWriting.tone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {project.serviceType === "ERP" && project.erp && (
            <div className="rounded-xl border border-service-erp/20 bg-service-erp/5 p-6 text-start">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-service-erp" />
                ERP Development Details
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">ERP Type</p>
                  <p className="font-medium text-foreground">
                    {project.erp.erpType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Integrations</p>
                  <p className="font-medium text-foreground">
                    {project.erp.integrationsRequired || "None"}
                  </p>
                </div>
              </div>
              {project.erp.modulesRequired &&
                project.erp.modulesRequired.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Modules
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.erp.modulesRequired.map((module) => (
                        <Badge key={module} variant="secondary">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Activity
            </h3>
            <div className="space-y-4">
              {/* Project Created */}
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm text-foreground">Project created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">Last updated</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(project.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Project Accepted */}
              {project.isAccepted && project.acceptedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm text-foreground">Project accepted</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(project.acceptedAt)}
                    </p>
                  </div>
                </div>
              )}
              {userTask && userTask.startTime && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-foreground">You started at</p>
                    <p className="text-xs text-muted-foreground">
                      {userTask.startTime}
                    </p>
                  </div>
                </div>
              )}
              {userTask && userTask.endTime && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                  <div>
                    <p className="text-sm text-foreground">You completed at</p>
                    <p className="text-xs text-muted-foreground">
                      {userTask.endTime}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {userTask && userTask.timeLog && userTask.timeLog.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Your Time Log
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userTask.timeLog.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium capitalize">{log.type}</p>
                      <p className="text-muted-foreground">{log.dateTime}</p>
                      {log.reason && (
                        <p className="text-muted-foreground italic">Reason: {log.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignedMember && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Team Member
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {assignedMember.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {assignedMember.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {assignedMember.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Notes</h3>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here..."
              className="min-h-[150px] resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}