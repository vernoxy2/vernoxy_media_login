import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "../Components/ui/form";
import { Button } from "../Components/ui/button";
import { BaseProjectForm } from "../Components/projects/forms/BaseProjectForm";
import { GraphicDesignForm } from "../Components/projects/forms/GraphicDesignForm";
import { WebsiteDesignForm } from "../Components/projects/forms/WebsiteDesignForm";
import { ContentWritingForm } from "../Components/projects/forms/ContentWritingForm";
import { ERPForm } from "../Components/projects/forms/ERPForm";
import { useProjects } from "../context/ProjectContext";
import { generateProjectId, generateClientCode } from "../lib/projectUtils";
import { ArrowLeft, Save, Eye, EyeOff, Loader2, Clock, Play, Pause, RotateCcw } from "lucide-react";

// User Info Component (for top-right corner)
const UserInfoDisplay = ({ currentUser }) => {
  if (!currentUser) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
        <span className="text-sm text-gray-500">Loading user info...</span>
      </div>
    );
  }

  // Get display text based on role and department
  const getDisplayRole = () => {
    if (currentUser.role === "admin") {
      return "Admin";
    }
    return currentUser.department || "User";
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-semibold text-lg">
        {currentUser.name?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {currentUser.name || 'User'}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getDisplayRole()} 
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
      {currentUser.email || 'Email'}
        </span>
      </div>
    </div>
  );
};

// Countdown Timer Component (for BaseProjectForm - right side of Project ID)
const CountdownTimer = ({ estimatedHours, estimatedMinutes, isActive, timerActive, onTimerStop }) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (timerActive) {
      const hours = parseInt(estimatedHours) || 0;
      const minutes = parseInt(estimatedMinutes) || 0;
      const total = (hours * 3600) + (minutes * 60);
      setTotalSeconds(total);
      setRemainingSeconds(total);
      setIsRunning(true);
    }
  }, [timerActive, estimatedHours, estimatedMinutes]);

  useEffect(() => {
    let interval;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onTimerStop) onTimerStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, onTimerStop]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  };

  const handleStart = () => {
    if (remainingSeconds > 0 && isActive) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setRemainingSeconds(totalSeconds);
    setIsRunning(false);
  };

  if (!isActive || !timerActive || totalSeconds === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-white" />
          <div>
            <div className="text-white text-xl font-bold font-mono">
              {formatTime(remainingSeconds)}
            </div>
            <div className="text-indigo-100 text-xs">
              {remainingSeconds === 0 ? "Time's up!" : "Remaining"}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-[120px]">
          <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000 ease-linear"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-1.5">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={remainingSeconds === 0}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Start Timer"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors"
              title="Pause Timer"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleReset}
            disabled={remainingSeconds === totalSeconds}
            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const projectSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  country: z.string().min(1, "Country is required"),
  serviceType: z.string().min(1, "Service type is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  status: z.string().default("Draft"),
  assignedTo: z.string().optional(),
  internalNotes: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  estimatedHours: z.string().optional(),
  estimatedMinutes: z.string().optional(),
  graphicDesign: z
    .object({
      postType: z.string().optional(),
      platform: z.string().optional(),
      size: z.string().optional(),
      mainText: z.string().optional(),
      subText: z.string().optional(),
      ctaText: z.string().optional(),
      hashtags: z.string().optional(),
      caption: z.string().optional(),
      designerNotes: z.string().optional(),
    })
    .catchall(z.any())
    .optional(),
  websiteDesign: z
    .object({
      websiteType: z.string().optional(),
      numberOfPages: z.string().optional(),
      technologyPreference: z.string().optional(),
      referenceWebsites: z.string().optional(),
      pages: z.array(z.object({
        pageName: z.string().optional(),
        pagePurpose: z.string().optional(),
        sections: z.array(z.object({
          sectionType: z.string().optional(),
          mainHeading: z.string().optional(),
          subHeading: z.string().optional(),
          paragraphText: z.string().optional(),
          buttonText: z.string().optional(),
          buttonLink: z.string().optional(),
          layoutNotes: z.string().optional(),
        })).optional(),
      })).optional(),
    })
    .optional(),
  contentWriting: z
    .object({
      contentType: z.string().optional(),
      wordCount: z.string().optional(),
      tone: z.string().optional(),
      mainContent: z.string().optional(),
      cta: z.string().optional(),
      seoKeywords: z.string().optional(),
      reviewNotes: z.string().optional(),
    })
    .optional(),
  erp: z
    .object({
      erpType: z.string().optional(),
      modulesRequired: z.array(z.string()).optional(),
      workflowDescription: z.string().optional(),
      userRoles: z.string().optional(),
      integrationsRequired: z.string().optional(),
      technicalNotes: z.string().optional(),
    })
    .optional(),
});

const getCurrentTime = () => {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
};

export default function NewProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { projects, addProject, updateProject, getProjectById, loading, currentUser } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldData, setShowOldData] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  
  const isEditMode = Boolean(id);
  const existingProject = isEditMode ? getProjectById(id) : null;
  const isContentWriter = currentUser?.department === "Content Writing";

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientName: "",
      country: "",
      serviceType: "",
      month: "",
      year: "2026",
      status: "Draft",
      assignedTo: "",
      internalNotes: "",
      startTime: "",
      endTime: "",
      estimatedHours: "0",
      estimatedMinutes: "0",
      graphicDesign: {
        postType: "",
        platform: "",
        size: "",
        mainText: "",
        subText: "",
        ctaText: "",
        hashtags: "",
        caption: "",
        designerNotes: "",
      },
      websiteDesign: {
        websiteType: "",
        numberOfPages: "",
        technologyPreference: "",
        referenceWebsites: "",
        pages: [],
      },
      contentWriting: {
        contentType: "",
        wordCount: "",
        tone: "",
        mainContent: "",
        cta: "",
        seoKeywords: "",
        reviewNotes: "",
      },
      erp: {
        erpType: "",
        modulesRequired: [],
        workflowDescription: "",
        userRoles: "",
        integrationsRequired: "",
        technicalNotes: "",
      },
    },
  });

  useEffect(() => {
    if (isEditMode && existingProject) {
      const graphicDesignData = {
        postType: "",
        platform: "",
        size: "",
        mainText: "",
        subText: "",
        ctaText: "",
        hashtags: "",
        caption: "",
        designerNotes: "",
        ...(existingProject.graphicDesign || {})
      };

      form.reset({
        clientName: existingProject.clientName || "",
        country: existingProject.country || "",
        serviceType: existingProject.serviceType || "",
        month: existingProject.month || "",
        year: existingProject.year || "",
        status: existingProject.status || "Draft",
        assignedTo: existingProject.assignedTo || "",
        internalNotes: existingProject.internalNotes || "",
        startTime: existingProject.startTime || "",
        endTime: existingProject.endTime || "",
        estimatedHours: existingProject.estimatedHours || "0",
        estimatedMinutes: existingProject.estimatedMinutes || "0",
        graphicDesign: graphicDesignData,
        websiteDesign: existingProject.websiteDesign || {
          websiteType: "",
          numberOfPages: "",
          technologyPreference: "",
          referenceWebsites: "",
          pages: [],
        },
        contentWriting: existingProject.contentWriting || {
          contentType: "",
          wordCount: "",
          tone: "",
          mainContent: "",
          cta: "",
          seoKeywords: "",
          reviewNotes: "",
        },
        erp: existingProject.erp || {
          erpType: "",
          modulesRequired: [],
          workflowDescription: "",
          userRoles: "",
          integrationsRequired: "",
          technicalNotes: "",
        },
      });
      setShowServiceForm(true);
    } else {
      form.setValue("status", "Draft");
    }
  }, [isEditMode, existingProject, form]);

  const watchedServiceType = form.watch("serviceType");
  const watchedClientName = form.watch("clientName");
  const watchedCountry = form.watch("country");
  const watchedMonth = form.watch("month");
  const watchedYear = form.watch("year");
  const watchedEstimatedHours = form.watch("estimatedHours");
  const watchedEstimatedMinutes = form.watch("estimatedMinutes");

  const generatedProjectId = useMemo(() => {
    if (isEditMode && existingProject) {
      return existingProject.projectId;
    }
    if (!watchedCountry || !watchedServiceType || !watchedClientName || !watchedMonth || !watchedYear) {
      return "";
    }
    const clientCode = generateClientCode(watchedClientName);
    return generateProjectId(
      watchedCountry,
      watchedServiceType,
      clientCode,
      watchedMonth,
      watchedYear,
      projects
    );
  }, [
    isEditMode,
    existingProject,
    watchedCountry,
    watchedServiceType,
    watchedClientName,
    watchedMonth,
    watchedYear,
    projects,
  ]);

  const handleCreateProject = () => {
    if (!watchedClientName || !watchedCountry || !watchedServiceType || !watchedMonth || !watchedYear) {
      alert("Please fill all required fields before creating project!");
      return;
    }

    const hours = parseInt(watchedEstimatedHours) || 0;
    const minutes = parseInt(watchedEstimatedMinutes) || 0;
    
    if (hours === 0 && minutes === 0) {
      alert("Please set estimated time before creating project!");
      return;
    }

    const currentTime = getCurrentTime();
    form.setValue("startTime", currentTime);
    setShowServiceForm(true);
    setTimerActive(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const endTime = getCurrentTime();
    try {
      if (isEditMode) {
        const updatedProject = {
          ...existingProject,
          status: isContentWriter ? "Draft" : data.status,
          internalNotes: data.internalNotes || "",
          startTime: data.startTime,
          endTime: endTime,
          estimatedHours: data.estimatedHours,
          estimatedMinutes: data.estimatedMinutes,
        };

        if (data.graphicDesign || existingProject.graphicDesign) {
          updatedProject.graphicDesign = {
            ...existingProject.graphicDesign,
            ...data.graphicDesign
          };
        }

        if (data.websiteDesign) {
          updatedProject.websiteDesign = data.websiteDesign;
        }

        if (data.contentWriting) {
          updatedProject.contentWriting = data.contentWriting;
        }

        if (data.erp) {
          updatedProject.erp = data.erp;
        }
        await updateProject(id, updatedProject);
        navigate(`/admin/projects/${id}`);
      } else {
        const getTextUpdates = (graphicDesignData) => {
          const updates = {};
          if (graphicDesignData) {
            Object.keys(graphicDesignData).forEach(key => {
              if (key.startsWith('mainText') || key.startsWith('subText')) {
                updates[key] = graphicDesignData[key];
              }
            });
          }
          return updates;
        };

        const newProject = {
          projectId: generatedProjectId,
          clientName: data.clientName,
          country: data.country,
          serviceType: data.serviceType,
          month: data.month,
          year: data.year,
          status: isContentWriter ? "Draft" : data.status,
          assignedTo: data.assignedTo || "",
          internalNotes: data.internalNotes || "",
          startTime: data.startTime,
          endTime: endTime,
          estimatedHours: data.estimatedHours,
          estimatedMinutes: data.estimatedMinutes,
          graphicDesign: data.serviceType === "GD" ? {
            postType: data.graphicDesign?.postType || "",
            platform: data.graphicDesign?.platform || "",
            size: data.graphicDesign?.size || "",
            mainText: data.graphicDesign?.mainText || "",
            subText: data.graphicDesign?.subText || "",
            ctaText: data.graphicDesign?.ctaText || "",
            hashtags: data.graphicDesign?.hashtags || "",
            caption: data.graphicDesign?.caption || "",
            designerNotes: data.graphicDesign?.designerNotes || "",
            ...getTextUpdates(data.graphicDesign)
          } : null,
          websiteDesign: data.serviceType === "WD" ? data.websiteDesign : null,
          contentWriting: data.serviceType === "CW" ? data.contentWriting : null,
          erp: data.serviceType === "ERP" ? data.erp : null,
        };
        await addProject(newProject);
        navigate("/admin/projects");
      }
    } catch (error) {
      alert("Error saving project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelServiceForm = () => {
    setShowServiceForm(false);
    setTimerActive(false);
    form.setValue("startTime", "");
    form.setValue("endTime", "");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEditMode && !existingProject) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-start">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Project" : "New Project"}
          </h1>
          <p className="text-muted-foreground text-md">
            {isEditMode
              ? `Update project status and notes for ${existingProject?.projectId}`
              : "Create a new project with all required details"}
          </p>
        </div>
        
        {/* User Info Display - Top Right Corner */}
        <UserInfoDisplay currentUser={currentUser} />

        {isEditMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOldData(!showOldData)}
          >
            {showOldData ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {showOldData ? "Hide" : "Show"} Project Data
          </Button>
        )}
      </div>

      {isEditMode && showOldData && existingProject && (
        <div className="mb-8 rounded-xl border border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 p-6">
          <h3 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">
            📋 Current Project Data (Read-Only)
          </h3>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">Project ID:</span>
                <p className="text-blue-800 dark:text-blue-300">{existingProject.projectId}</p>
              </div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">Client Name:</span>
                <p className="text-blue-800 dark:text-blue-300">{existingProject.clientName}</p>
              </div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">Start Time:</span>
                <p className="text-blue-800 dark:text-blue-300">{existingProject.startTime || 'Not set'}</p>
              </div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">End Time:</span>
                <p className="text-blue-800 dark:text-blue-300">{existingProject.endTime || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Project Information
            </h2>
            <BaseProjectForm
              form={form}
              projectId={generatedProjectId}
              isEditMode={isEditMode}
              isContentWriter={isContentWriter}
              currentUser={currentUser}
              showServiceForm={showServiceForm}
              onTimerStart={() => {
                const hours = parseInt(watchedEstimatedHours) || 0;
                const minutes = parseInt(watchedEstimatedMinutes) || 0;
                
                if (hours === 0 && minutes === 0) {
                  alert("Please set estimated time before starting timer!");
                  return;
                }
                
                if (!watchedClientName || !watchedCountry || !watchedServiceType || !watchedMonth || !watchedYear) {
                  alert("Please fill all required fields before starting timer!");
                  return;
                }
                
                const currentTime = getCurrentTime();
                form.setValue("startTime", currentTime);
                setShowServiceForm(true);
                setTimerActive(true);
              }}
              countdownTimerComponent={
                <CountdownTimer
                  estimatedHours={watchedEstimatedHours}
                  estimatedMinutes={watchedEstimatedMinutes}
                  isActive={showServiceForm}
                  timerActive={timerActive}
                  onTimerStop={() => setTimerActive(false)}
                />
              }
            />
          </div>

          {showServiceForm && (
            <>
              {watchedServiceType === "GD" && (
                <GraphicDesignForm
                  form={form}
                  isEditMode={isEditMode}
                  existingData={existingProject?.graphicDesign}
                />
              )}
              {watchedServiceType === "WD" && (
                <WebsiteDesignForm form={form} isEditMode={isEditMode} />
              )}
              {watchedServiceType === "CW" && (
                <ContentWritingForm form={form} isEditMode={isEditMode} />
              )}
              {watchedServiceType === "ERP" && (
                <ERPForm form={form} isEditMode={isEditMode} />
              )}

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelServiceForm}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Submit Project
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}