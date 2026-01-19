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
import { useTimer } from "../context/TimerContext";
import { generateProjectId, generateClientCode } from "../lib/projectUtils";
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

// User Info Component
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

const projectSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  country: z.string().min(1, "Country is required"),
  serviceType: z.string().min(1, "Service type is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  status: z.string().default("Draft"),
  assignedTo: z.string().optional(),
  internalNotes: z.string().optional(),
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

export default function NewProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { projects, addProject, updateProject, getProjectById, loading, currentUser } = useProjects();
  const { startTimer, activeTimer, stopTimer } = useTimer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldData, setShowOldData] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState(null);

  const isEditMode = Boolean(id);
  const existingProject = isEditMode ? getProjectById(id) : null;
  const isContentWriter = currentUser?.department === "Content Writing";
  const currentUserId = localStorage.getItem("userId");

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
  const watchedAssignedTo = form.watch("assignedTo");
  const generatedProjectId = useMemo(() => {
    if (isEditMode && existingProject) {
      return existingProject.projectId;
    }

    if (loading) {
      return "";
    }

    if (!watchedCountry || !watchedServiceType || !watchedClientName || !watchedMonth || !watchedYear) {
      return "";
    }

    const clientCode = generateClientCode(watchedClientName);
    const newId = generateProjectId(
      watchedCountry,
      watchedServiceType,
      clientCode,
      watchedMonth,
      watchedYear,
      projects
    );
    return newId;
  }, [
    isEditMode,
    existingProject,
    loading,
    watchedCountry,
    watchedServiceType,
    watchedClientName,
    watchedMonth,
    watchedYear,
    projects,
  ]);

  const handleStartTimer = async () => {
    if (!watchedClientName || !watchedCountry || !watchedServiceType || !watchedMonth || !watchedYear) {
      toast.error("Please fill all required fields before starting timer!");
      return;
    }

    const hours = parseInt(watchedEstimatedHours) || 0;
    const minutes = parseInt(watchedEstimatedMinutes) || 0;

    if (hours === 0 && minutes === 0) {
      toast.error("Please set estimated time before starting timer!");
      return;
    }

    if (!generatedProjectId) {
      toast.error("Project ID generation failed. Please try again.");
      return;
    }

    try {
      const currentTime = getCurrentTime();
      const currentDateTime = new Date().toISOString();

      // Create initial user task entry
      const initialUserTask = {
        userId: currentUserId,
        userEmail: currentUser?.email || "",
        userName: currentUser?.name || currentUser?.email || "",
        taskStatus: 'in_progress', // User-specific task status
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

      // Create project in Firebase with user task
      const newProject = {
        projectId: generatedProjectId,
        clientName: watchedClientName,
        country: watchedCountry,
        serviceType: watchedServiceType,
        month: watchedMonth,
        year: watchedYear,
        status: "Draft", // Project status remains Draft
        assignedTo: watchedAssignedTo || currentUser?.email || "",
        internalNotes: "",
        estimatedHours: watchedEstimatedHours,
        estimatedMinutes: watchedEstimatedMinutes,
        userTasks: [initialUserTask], // Add initial user task
        isAccepted: true,
        acceptedAt: currentDateTime,
        createdAt: currentDateTime,
        updatedAt: currentDateTime
      };

      const createdProject = await addProject(newProject);
      setCreatedProjectId(createdProject.id);

      // Start the timer with Firebase ID
      await startTimer({
        projectId: generatedProjectId,
        firebaseId: createdProject.id,
        clientName: watchedClientName,
        serviceType: watchedServiceType,
        estimatedHours: watchedEstimatedHours,
        estimatedMinutes: watchedEstimatedMinutes,
        userId: currentUserId
      });

      setShowServiceForm(true);
      toast.success("Project created and timer started!");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    }
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
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const projectIdToUpdate = isEditMode ? id : createdProjectId;

      if (!projectIdToUpdate) {
        throw new Error("No project ID found. Please start the timer first.");
      }

      const currentTime = getCurrentTime();
      const currentDateTime = new Date().toISOString();

      // Get existing project to update user tasks
      const existingProject = getProjectById(projectIdToUpdate);
      let updatedUserTasks = existingProject?.userTasks || [];

      // Find and update current user's task
      const userTaskIndex = updatedUserTasks.findIndex(
        task => task.userId === currentUserId
      );

      if (userTaskIndex !== -1) {
        // Update existing user task
        updatedUserTasks[userTaskIndex] = {
          ...updatedUserTasks[userTaskIndex],
          taskStatus: 'completed',
          endTime: currentTime,
          timeLog: [
            ...(updatedUserTasks[userTaskIndex].timeLog || []),
            {
              type: 'end',
              dateTime: currentDateTime,
              timestamp: currentTime
            }
          ]
        };
      }

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

      const updatedProject = {
       status: "Draft", // Update project status
        internalNotes: data.internalNotes || "",
        estimatedHours: data.estimatedHours,
        estimatedMinutes: data.estimatedMinutes,
        userTasks: updatedUserTasks, // Update user tasks array
        updatedAt: currentDateTime
      };

      // Add service-specific data
      if (data.serviceType === "GD" && data.graphicDesign) {
        updatedProject.graphicDesign = {
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
        };
      }

      if (data.serviceType === "WD" && data.websiteDesign) {
        updatedProject.websiteDesign = data.websiteDesign;
      }

      if (data.serviceType === "CW" && data.contentWriting) {
        updatedProject.contentWriting = data.contentWriting;
      }

      if (data.serviceType === "ERP" && data.erp) {
        updatedProject.erp = data.erp;
      }

      await updateProject(projectIdToUpdate, updatedProject);

      // Stop timer if it's running
      if (activeTimer && activeTimer.firebaseId === projectIdToUpdate) {
        await stopTimer();
      }

      toast.success("Project submitted successfully!");
      navigate(`/admin/projects`);
    } catch (error) {
      console.error("❌ Error saving project:", error);
      toast.error(`Error saving project: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelServiceForm = async () => {
    if (window.confirm('Are you sure you want to cancel? This will stop the timer and you may lose unsaved changes.')) {
      setShowServiceForm(false);

      // Stop timer if running
      if (activeTimer) {
        await stopTimer();
      }

      // Navigate back to projects list
      navigate("/admin/projects");
    }
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
              ? `Update project details for ${existingProject?.projectId}`
              : "Create a new project with all required details"}
          </p>
        </div>

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
              onTimerStart={handleStartTimer}
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