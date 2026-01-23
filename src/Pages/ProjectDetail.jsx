import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjects } from "../context/ProjectContext";
import { useTimer } from "../context/TimerContext";
import { SERVICE_NAMES, COUNTRY_NAMES } from "../types/project";
import { getStatusColor, getServiceColor } from "../lib/projectUtils";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Separator } from "../Components/ui/separator";
import { Textarea } from "../Components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  User,
  Globe,
  Briefcase,
  Activity,
  Users,
  Clock,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById, teamMembers, updateProject, updateProjectSilent } =
    useProjects();
  const { startTimer, activeTimer } = useTimer();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState("0");
  const [estimatedMinutes, setEstimatedMinutes] = useState("0");
  const [elapsedTime, setElapsedTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasTimerStarted, setHasTimerStarted] = useState(false);

  const project = getProjectById(id || "");
  const currentUserEmail = localStorage.getItem("userEmail");
  const currentUserId = localStorage.getItem("userId");
  const currentUserName = localStorage.getItem("userName") || currentUserEmail;
  const currentUserDepartment = localStorage.getItem("userDepartment");
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [liveUserTask, setLiveUserTask] = useState(null);

  useEffect(() => {
    if (!project) return;

    if (project.notes) {
      setNotes(project.notes);
    }

    // Load estimated time from project (preserves the time even after refresh)
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

    const userTask = project.userTasks?.find(
      (task) => task.userId === currentUserId,
    );

    // Check if user has any task (started, paused, or completed)
    if (userTask && userTask.timeLog && userTask.timeLog.length > 0) {
      setHasTimerStarted(true);
    } else {
      setHasTimerStarted(false);
    }
  }, [project, currentUserId]);

  useEffect(() => {
    if (!id) return;

    console.log("🔥 Setting up real-time listener for project:", id);

    const projectRef = doc(db, "projects", id);
    const unsubscribe = onSnapshot(
      projectRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const updatedProject = docSnapshot.data();

          console.log("📡 Real-time update received:", {
            projectId: updatedProject.projectId,
            userTasks: updatedProject.userTasks?.length || 0,
          });
          const userTask = updatedProject.userTasks?.find(
            (task) => task.userId === currentUserId,
          );

          if (userTask) {
            console.log(
              "✅ Found user task with timeLog:",
              userTask.timeLog?.length || 0,
            );
            setLiveUserTask(userTask);

            // Update hasTimerStarted based on whether user has any time entries
            if (userTask.timeLog && userTask.timeLog.length > 0) {
              setHasTimerStarted(true);
            }
          } else {
            setLiveUserTask(null);
            setHasTimerStarted(false);
          }

          // Update context silently
          updateProjectSilent(id, updatedProject);
        }
      },
      (error) => {
        console.error("❌ Error listening to project updates:", error);
      },
    );

    return () => {
      console.log("🔴 Cleaning up listener for project:", id);
      unsubscribe();
    };
  }, [id, currentUserId]);

  useEffect(() => {
    const userTaskData = liveUserTask || getCurrentUserTask();
    if (userTaskData?.taskStatus === "in_progress" && userTaskData?.timeLog) {
      const interval = setInterval(() => {
        const elapsed = calculateElapsedTime(userTaskData.timeLog);
        setElapsedTime(elapsed);
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else if (userTaskData?.timeLog) {
      const elapsed = calculateElapsedTime(userTaskData.timeLog);
      setElapsedTime(elapsed);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [liveUserTask, project?.userTasks, currentUserId]);

  useEffect(() => {
    if (!project) {
      setShowButtons(false);
      return;
    }
    if (
      currentUserEmail &&
      currentUserDepartment === "Graphic Design" &&
      project.serviceType === "GD"
    ) {
      setShowButtons(true);
    } else {
      setShowButtons(false);
    }
  }, [currentUserEmail, currentUserDepartment, project]);

  const hasActiveTask = () => {
    if (!project?.userTasks || !currentUserId) return false;
    const userTask = project.userTasks.find(
      (task) => task.userId === currentUserId,
    );
    return (
      userTask &&
      (userTask.taskStatus === "in_progress" ||
        userTask.taskStatus === "paused")
    );
  };

  const getCurrentUserTask = () => {
    if (!project?.userTasks || !currentUserId) return null;
    return project.userTasks.find((task) => task.userId === currentUserId);
  };

  const calculateElapsedTime = (timeLog) => {
    if (!timeLog || timeLog.length === 0)
      return { hours: 0, minutes: 0, seconds: 0 };
    let totalSeconds = 0;
    let lastStartTime = null;
    for (const entry of timeLog) {
      if (!entry.timestamp) continue;
      const entryTime = new Date(entry.timestamp).getTime();
      if (isNaN(entryTime)) continue;
      if (entry.type === "start" || entry.type === "resume") {
        lastStartTime = entryTime;
      } else if (entry.type === "pause" || entry.type === "end") {
        if (lastStartTime) {
          totalSeconds += (entryTime - lastStartTime) / 1000;
          lastStartTime = null;
        }
      }
    }
    const userTaskData = liveUserTask || getCurrentUserTask();
    if (lastStartTime && userTaskData?.taskStatus === "in_progress") {
      totalSeconds += (Date.now() - lastStartTime) / 1000;
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return { hours, minutes, seconds };
  };

  if (!project) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
        <p className="mb-4 text-muted-foreground">Project not found</p>
        <Link to="/admin/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const assignedMember = teamMembers.find(
    (m) => m.id === project.assignedTo || m.name === project.assignedTo,
  );

  const formatDate = (date) => {
    if (!date) return "Not set";

    try {
      const dateObj = date?.toDate ? date.toDate() : new Date(date);

      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not set";

    try {
      const date = dateTime?.toDate ? dateTime.toDate() : new Date(dateTime);

      if (isNaN(date.getTime())) {
        return String(dateTime);
      }

      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting dateTime:", error);
      return String(dateTime);
    }
  };

  const handleAcceptClick = async () => {
    setIsSubmitting(true);
    try {
      const currentDateTime = new Date().toISOString();

      const updateData = {
        status: "Accepted",
        isAccepted: true,
        acceptedAt: currentDateTime,
        updatedAt: currentDateTime,
      };

      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, updateData);
      await updateProject(id, updateData);

      toast.success("Project accepted!");
    } catch (error) {
      console.error("Error accepting project:", error);
      toast.error("Failed to accept project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = async () => {
    // CRITICAL FIX: Use liveUserTask first, fallback to getCurrentUserTask
    const userTask = liveUserTask || getCurrentUserTask();

    console.log("🔍 handleSubmitClick - userTask:", userTask);
    console.log("🔍 handleSubmitClick - liveUserTask:", liveUserTask);
    console.log(
      "🔍 handleSubmitClick - getCurrentUserTask():",
      getCurrentUserTask(),
    );

    if (
      !userTask ||
      (userTask.taskStatus !== "in_progress" &&
        userTask.taskStatus !== "paused")
    ) {
      toast.info("No active task to submit!");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentDateTime = new Date().toISOString();
      const existingUserTasks = project.userTasks || [];

      console.log("🔍 Before submit - userTask:", userTask);
      console.log("🔍 Before submit - userTask.timeLog:", userTask.timeLog);
      console.log(
        "🔍 Before submit - timeLog length:",
        userTask.timeLog?.length,
      );

      // CRITICAL FIX: Use the LIVE userTask's timeLog directly
      const updatedUserTasks = existingUserTasks.map((task) => {
        if (task.userId === currentUserId) {
          // Get the most up-to-date timeLog from liveUserTask
          const currentTimeLogs = Array.isArray(userTask.timeLog)
            ? [...userTask.timeLog]
            : [];

          console.log("🔍 Using timeLog from live task:", currentTimeLogs);
          console.log("🔍 Live timeLog length:", currentTimeLogs.length);

          const endEntry = {
            type: "end",
            timestamp: currentDateTime,
            dateTime: formatDateTime(currentDateTime),
          };

          const finalTimeLogs = [...currentTimeLogs, endEntry];

          console.log("✅ Final timeLog being saved:", finalTimeLogs);
          console.log("✅ Final timeLog count:", finalTimeLogs.length);

          return {
            ...task,
            taskStatus: "completed",
            endTime: formatDateTime(currentDateTime),
            timeLog: finalTimeLogs,
          };
        }
        return task;
      });

      console.log(
        "📤 Sending to Firebase - updatedUserTasks:",
        updatedUserTasks,
      );

      const updateData = {
        status: "Review",
        updatedAt: currentDateTime,
        userTasks: updatedUserTasks,
      };

      // Update Firebase
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, updateData);

      toast.success("Project submitted successfully!");
      setTimeout(() => {
        navigate("/admin/projects");
      }, 1000);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to submit project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const currentDateTime = new Date().toISOString();
      const existingUserTasks = project.userTasks || [];

      const newUserTask = {
        userId: currentUserId,
        userEmail: currentUserEmail,
        userName: currentUserName,
        taskStatus: "in_progress",
        startTime: formatDateTime(currentDateTime),
        endTime: null,
        timeLog: [
          {
            type: "start",
            timestamp: currentDateTime,
            dateTime: formatDateTime(currentDateTime),
          },
        ],
      };

      const updateData = {
        status: "In Progress",
        startWorkTime: formatDateTime(currentDateTime),
        startedAt: currentDateTime,
        estimatedHours: estimatedHours,
        estimatedMinutes: estimatedMinutes,
        updatedAt: currentDateTime,
        userTasks: [...existingUserTasks, newUserTask],
      };

      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, updateData);
      await updateProject(id, updateData);

      await startTimer({
        projectId: project.projectId,
        firebaseId: id,
        clientName: project.clientName,
        serviceType: project.serviceType,
        estimatedHours: estimatedHours,
        estimatedMinutes: estimatedMinutes,
        userId: currentUserId,
      });

      toast.success("Timer started! Status: In Progress");
      setShowSubmitButton(true);
      setHasTimerStarted(true);
    } catch (error) {
      console.error("Error starting timer:", error);
      toast.error("Failed to start timer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userTask = getCurrentUserTask();

  return (
    <div className="p-8">
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
                  <Badge
                    className={cn(
                      userTask.taskStatus === "in_progress" && "bg-blue-500",
                      userTask.taskStatus === "paused" && "bg-yellow-500",
                      userTask.taskStatus === "completed" && "bg-green-500",
                    )}
                  >
                    Your Task:{" "}
                    {userTask.taskStatus === "in_progress"
                      ? "In Progress"
                      : userTask.taskStatus === "paused"
                        ? "Paused"
                        : "Completed"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {showButtons && (
          <div className="flex gap-2 items-center">
            {project.status === "Draft" && project.serviceType === "GD" && (
              <Button
                onClick={handleAcceptClick}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                {isSubmitting ? "Accepting..." : "Accept"}
              </Button>
            )}

            {(project.status === "Accepted" ||
              project.status === "In Progress") &&
              project.serviceType === "GD" && (
                <>
                  <select
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={hasTimerStarted}
                  >
                    {Array.from({ length: 13 }, (_, i) => (
                      <option key={i} value={i.toString()}>
                        {i}h
                      </option>
                    ))}
                  </select>
                  <select
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={hasTimerStarted}
                  >
                    {Array.from({ length: 61 }, (_, i) => (
                      <option key={i} value={i.toString()}>
                        {i}m
                      </option>
                    ))}
                  </select>

                  {project.status === "Accepted" && !hasTimerStarted && (
                    <Button
                      onClick={handleStartClick}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                    >
                      {isSubmitting ? "Starting..." : "Start Timer"}
                    </Button>
                  )}

                  {hasTimerStarted && (
                    <Button
                      onClick={handleSubmitClick}
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </>
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
                      getServiceColor(project.serviceType),
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
                      getStatusColor(project.status),
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
                    <p className="text-sm text-muted-foreground">
                      Estimated Time
                    </p>
                    <p className="font-medium text-foreground">
                      {project.estimatedHours}h {project.estimatedMinutes}m
                    </p>
                  </div>
                </div>
              )}

              {/* {userTask && userTask.timeLog && hasTimerStarted && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Your Elapsed Time
                    </p>
                    <p className="font-medium text-foreground">
                      {elapsedTime.hours}h {elapsedTime.minutes}m{" "}
                      {elapsedTime.seconds}s
                    </p>
                  </div>
                </div>
              )} */}
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
              <div className="grid gap-4 md:grid-cols-3 text-start">
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
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm text-foreground">Project created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">Last updated</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(project.updatedAt)}
                  </p>
                </div>
              </div>

              {project.isAccepted && project.acceptedAt && (
                <div className="flex items-start gap-3 text-start">
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
                <div className="flex items-start gap-3 text-start">
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
                <div className="flex items-start gap-3 text-start">
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

          {(liveUserTask || userTask)?.timeLog?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Your Time Log ({(liveUserTask || userTask).timeLog.length}{" "}
                entries)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto text-start">
                {(liveUserTask || userTask).timeLog.map((log, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-sm pb-2"
                    >
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium">
                          {log.type === "start"
                            ? "Started"
                            : log.type === "pause"
                              ? "Paused"
                              : log.type === "resume"
                                ? "Resumed"
                                : log.type === "end"
                                  ? "Completed"
                                  : log.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.dateTime ||
                            new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {log.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
