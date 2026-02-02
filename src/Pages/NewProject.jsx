import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "../Components/ui/form";
import { Button } from "../Components/ui/button";
import {
  BaseProjectForm,
  clearBaseProjectAutosave,
} from "../Components/projects/forms/BaseProjectForm";
import {
  GraphicDesignForm,
  clearGraphicDesignAutosave,
} from "../Components/projects/forms/GraphicDesignForm";
import {
  WebsiteDesignForm,
  clearWebsiteDesignAutosave,
} from "../Components/projects/forms/WebsiteDesignForm";
import { ContentWritingForm } from "../Components/projects/forms/ContentWritingForm";
import {
  ERPForm,
  clearERPAutosave,
} from "../Components/projects/forms/ERPForm";
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
        {currentUser.name?.charAt(0).toUpperCase() || "U"}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {currentUser.name || "User"}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getDisplayRole()}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {currentUser.email || "Email"}
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
      link: z
        .array(
          z
            .string()
            .trim()
            .refine(
              (val) =>
                val === "" || /^(https?:\/\/|www\.)[^\s]+\.[^\s]+$/.test(val),
              "Please enter a valid link (http, https, or www)",
            ),
        )
        .optional(),
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
      link: z
        .array(
          z
            .string()
            .trim()
            .refine(
              (val) =>
                val === "" || /^(https?:\/\/|www\.)[^\s]+\.[^\s]+$/.test(val),
              "Please enter a valid link (http, https, or www)",
            ),
        )
        .optional(),
      pages: z
        .array(
          z.object({
            pageName: z.string().optional(),
            pagePurpose: z.string().optional(),
            sections: z
              .array(
                z.object({
                  sectionType: z.string().optional(),
                  mainHeading: z.string().optional(),
                  subHeading: z.string().optional(),
                  paragraphText: z.string().optional(),
                  buttonText: z.string().optional(),
                  buttonLink: z.string().optional(),
                  layoutNotes: z.string().optional(),
                }),
              )
              .optional(),
          }),
        )
        .optional(),
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
      link: z
        .array(
          z
            .string()
            .trim()
            .refine(
              (val) =>
                val === "" || /^(https?:\/\/|www\.)[^\s]+\.[^\s]+$/.test(val),
              "Please enter a valid link (http, https, or www)",
            ),
        )
        .optional(),
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
  const {
    projects,
    addProject,
    updateProject,
    getProjectById,
    loading,
    currentUser,
  } = useProjects();
  const { startTimer, activeTimer, stopTimer } = useTimer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldData, setShowOldData] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const CURRENT_MONTH = new Date().toLocaleString("default", { month: "long" });
  const CURRENT_YEAR = new Date().getFullYear().toString();
  const isEditMode = Boolean(id);
  const existingProject = isEditMode ? getProjectById(id) : null;
  const isContentWriter = currentUser?.department === "Content Writer";
  const isAdmin = currentUser?.role === "admin";
  const currentUserId = localStorage.getItem("userId");
  const hideAdminFromDropdown = true;

  console.log("🚀 NewProject Component Loaded");
  console.log("📅 CURRENT_MONTH:", CURRENT_MONTH);
  console.log("📅 CURRENT_YEAR:", CURRENT_YEAR);
  console.log("🔧 isEditMode:", isEditMode);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientName: "",
      country: "",
      serviceType: "",
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
      status: "Draft",
      assignedTo: "",
      internalNotes: "",
      estimatedHours: "0",
      estimatedMinutes: "0",
      graphicDesign: {
        postType: "",
        platform: "",
        size: "",
        link: [""],
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
        link: [""],
        technologyPreference: "",
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
        link: [""],
        workflowDescription: "",
        userRoles: "",
        integrationsRequired: "",
        technicalNotes: "",
      },
    },
  });

  console.log("📝 Form initialized with defaultValues");
  console.log("📝 Initial form values:", form.getValues());

  useEffect(() => {
    console.log("🔄 useEffect triggered");
    console.log("🔧 isEditMode:", isEditMode);
    console.log("🔧 existingProject:", existingProject);

    if (isEditMode && existingProject) {
      console.log("✏️ EDIT MODE - Loading existing project");
      
      const userTask = existingProject.userTasks?.find(
        (task) => task.userId === currentUserId,
      );

      console.log("👤 User task found:", userTask);

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
        ...(existingProject.graphicDesign || {}),
      };

      form.reset({
        clientName: existingProject.clientName || "",
        country: existingProject.country || "",
        serviceType: existingProject.serviceType || "",
        month: existingProject.month || CURRENT_MONTH,
        year: existingProject.year || CURRENT_YEAR,
        status: existingProject.status || "Draft",
        assignedTo: existingProject.assignedTo || "",
        internalNotes: existingProject.internalNotes || "",
        estimatedHours: userTask?.estimatedHours || "0",
        estimatedMinutes: userTask?.estimatedMinutes || "0",
        graphicDesign: graphicDesignData,
        websiteDesign: existingProject.websiteDesign || {
          websiteType: "",
          numberOfPages: "",
          technologyPreference: "",
          link: [""],
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
      console.log("✅ Edit mode form reset complete");
    } else {
      console.log("🆕 NEW PROJECT MODE");
      console.log("🔧 Setting default values...");
      console.log("🔧 CURRENT_MONTH:", CURRENT_MONTH);
      console.log("🔧 CURRENT_YEAR:", CURRENT_YEAR);
      
      form.setValue("status", "Draft");
      form.setValue("month", CURRENT_MONTH);
      form.setValue("year", CURRENT_YEAR);
      
      console.log("✅ After setValue - status:", form.getValues("status"));
      console.log("✅ After setValue - month:", form.getValues("month"));
      console.log("✅ After setValue - year:", form.getValues("year"));
      console.log("✅ All form values:", form.getValues());
    }
  }, [isEditMode, existingProject, form, currentUserId, CURRENT_MONTH, CURRENT_YEAR]);

  // ✅ DEBUG: Watch form values in real-time
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("👁️ Form value changed:");
      console.log("   Field name:", name);
      console.log("   Change type:", type);
      console.log("   New value:", value[name]);
      console.log("   All values:", value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const watchedServiceType = form.watch("serviceType");
  const watchedClientName = form.watch("clientName");
  const watchedCountry = form.watch("country");
  const watchedMonth = form.watch("month");
  const watchedYear = form.watch("year");
  const watchedEstimatedHours = form.watch("estimatedHours");
  const watchedEstimatedMinutes = form.watch("estimatedMinutes");
  const watchedAssignedTo = form.watch("assignedTo");

  console.log("👁️ Watched values:");
  console.log("   Month:", watchedMonth);
  console.log("   Year:", watchedYear);
  console.log("   Service Type:", watchedServiceType);

  const generatedProjectId = useMemo(() => {
    if (isEditMode && existingProject) {
      return existingProject.projectId;
    }

    if (loading) {
      return "";
    }

    if (
      !watchedCountry ||
      !watchedServiceType ||
      !watchedClientName ||
      !watchedMonth ||
      !watchedYear
    ) {
      console.log("⚠️ Cannot generate project ID - missing fields");
      return "";
    }

    const clientCode = generateClientCode(watchedClientName);
    const newId = generateProjectId(
      watchedCountry,
      watchedServiceType,
      clientCode,
      watchedMonth,
      watchedYear,
      projects,
    );
    console.log("🆔 Generated Project ID:", newId);
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
    console.log("⏰ handleStartTimer called");
    console.log("📋 Validating fields...");
    console.log("   Client Name:", watchedClientName);
    console.log("   Country:", watchedCountry);
    console.log("   Service Type:", watchedServiceType);
    console.log("   Month:", watchedMonth);
    console.log("   Year:", watchedYear);

    if (
      !watchedClientName ||
      !watchedCountry ||
      !watchedServiceType ||
      !watchedMonth ||
      !watchedYear
    ) {
      console.error("❌ Missing required fields");
      toast.error("Please fill all required fields before starting timer!");
      return;
    }

    const hours = parseInt(watchedEstimatedHours) || 0;
    const minutes = parseInt(watchedEstimatedMinutes) || 0;

    console.log("⏱️ Estimated time - Hours:", hours, "Minutes:", minutes);

    if (hours === 0 && minutes === 0) {
      console.error("❌ No estimated time set");
      toast.error("Please set estimated time before starting timer!");
      return;
    }

    if (!generatedProjectId) {
      console.error("❌ Project ID generation failed");
      toast.error("Project ID generation failed. Please try again.");
      return;
    }

    try {
      console.log("🚀 Creating new project...");
      const currentTime = getCurrentTime();
      const currentDateTime = new Date().toISOString();

      const initialUserTask = {
        userId: currentUserId,
        userEmail: currentUser?.email || "",
        userName: currentUser?.name || currentUser?.email || "",
        taskStatus: "in_progress",
        startTime: currentTime,
        serviceType: watchedServiceType,
        endTime: null,
        estimatedHours: watchedEstimatedHours,
        estimatedMinutes: watchedEstimatedMinutes,
        timeLog: [
          {
            type: "start",
            dateTime: currentDateTime,
            timestamp: currentTime,
          },
        ],
      };

      const newProject = {
        projectId: generatedProjectId,
        clientName: watchedClientName,
        country: watchedCountry,
        serviceType: watchedServiceType,
        month: watchedMonth,
        year: watchedYear,
        status: "Draft",
        assignedTo: watchedAssignedTo || currentUserId,
        internalNotes: "",
        estimatedHours: watchedEstimatedHours,
        estimatedMinutes: watchedEstimatedMinutes,
        userTasks: [initialUserTask],
        isAccepted: true,
        acceptedAt: currentDateTime,
        createdAt: currentDateTime,
        updatedAt: currentDateTime,
      };

      console.log("📦 New project data:", newProject);

      const createdProject = await addProject(newProject);
      console.log("✅ Project created:", createdProject);
      setCreatedProjectId(createdProject.id);

      await startTimer({
        projectId: generatedProjectId,
        firebaseId: createdProject.id,
        clientName: watchedClientName,
        serviceType: watchedServiceType,
        estimatedHours: watchedEstimatedHours,
        estimatedMinutes: watchedEstimatedMinutes,
        userId: currentUserId,
      });

      console.log("✅ Timer started");
      setShowServiceForm(true);
      toast.success("Project created and timer started!");
    } catch (error) {
      console.error("❌ Error creating project:", error);
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
    console.log("📝 Form submitted");
    console.log("🔍 Form Data:", data);
    console.log("🔍 Graphic Design Data:", data.graphicDesign);
    console.log("🔍 Links Array:", data.graphicDesign?.link);
    
    setIsSubmitting(true);
    try {
      const projectIdToUpdate = isEditMode ? id : createdProjectId;
      console.log("🆔 Project ID to update:", projectIdToUpdate);
      
      if (!projectIdToUpdate) {
        throw new Error("No project ID found. Please start the timer first.");
      }
      
      const currentTime = getCurrentTime();
      const currentDateTime = new Date().toISOString();
      const existingProject = getProjectById(projectIdToUpdate);
      let updatedUserTasks = existingProject?.userTasks || [];
      const userTaskIndex = updatedUserTasks.findIndex(
        (task) => task.userId === currentUserId,
      );

      if (userTaskIndex !== -1) {
        const existingTask = updatedUserTasks[userTaskIndex];
        updatedUserTasks[userTaskIndex] = {
          ...existingTask,
          taskStatus: "completed",
          endTime: currentTime,
          completedAt: currentDateTime,
          estimatedHours: existingTask.estimatedHours,
          estimatedMinutes: existingTask.estimatedMinutes,
          timeLog: [
            ...(existingTask.timeLog || []),
            {
              type: "end",
              dateTime: currentDateTime,
              timestamp: currentTime,
            },
          ],
        };
      }

      const getTextUpdates = (graphicDesignData) => {
        const updates = {};
        if (graphicDesignData) {
          Object.keys(graphicDesignData).forEach((key) => {
            if (key.startsWith("mainText") || key.startsWith("subText")) {
              updates[key] = graphicDesignData[key];
            }
          });
        }
        return updates;
      };

      const updatedProject = {
        status: "Draft",
        internalNotes: data.internalNotes || "",
        estimatedHours: data.estimatedHours,
        estimatedMinutes: data.estimatedMinutes,
        userTasks: updatedUserTasks,
        updatedAt: currentDateTime,
      };

      if (data.serviceType === "GD" && data.graphicDesign) {
        updatedProject.graphicDesign = {
          postType: data.graphicDesign?.postType || "",
          platform: data.graphicDesign?.platform || "",
          size: data.graphicDesign?.size || "",
          link: Array.isArray(data.graphicDesign?.link)
            ? data.graphicDesign.link.filter((l) => l && l.trim() !== "")
            : [],
          mainText: data.graphicDesign?.mainText || "",
          subText: data.graphicDesign?.subText || "",
          ctaText: data.graphicDesign?.ctaText || "",
          hashtags: data.graphicDesign?.hashtags || "",
          caption: data.graphicDesign?.caption || "",
          designerNotes: data.graphicDesign?.designerNotes || "",
          ...getTextUpdates(data.graphicDesign),
        };
        console.log("✅ Updated Project Graphic Design:", updatedProject.graphicDesign);
        console.log("✅ Links being saved:", updatedProject.graphicDesign.link);
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

      console.log("🚀 FINAL DATA SENDING TO FIREBASE:", updatedProject);
      await updateProject(projectIdToUpdate, updatedProject);
      console.log("✅ Project updated successfully");

      if (activeTimer && activeTimer.firebaseId === projectIdToUpdate) {
        await stopTimer();
        console.log("⏹️ Timer stopped");
      }
      
      clearGraphicDesignAutosave(generatedProjectId);
      clearBaseProjectAutosave(generatedProjectId);
      clearWebsiteDesignAutosave(generatedProjectId);
      clearERPAutosave(generatedProjectId);

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
    if (
      window.confirm(
        "Are you sure you want to cancel? This will stop the timer and you may lose unsaved changes.",
      )
    ) {
      console.log("🚫 Form cancelled");
      setShowServiceForm(false);

      if (activeTimer) {
        await stopTimer();
        console.log("⏹️ Timer stopped due to cancellation");
      }

      navigate("/admin/projects");
    }
  };

  if (loading) {
    console.log("⏳ Loading...");
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEditMode && !existingProject) {
    console.log("❌ Project not found in edit mode");
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  console.log("🎨 Rendering form");

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
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  Project ID:
                </span>
                <p className="text-blue-800 dark:text-blue-300">
                  {existingProject.projectId}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  Client Name:
                </span>
                <p className="text-blue-800 dark:text-blue-300">
                  {existingProject.clientName}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  Assigned To (ID):
                </span>
                <p className="text-blue-800 dark:text-blue-300">
                  {existingProject.assignedTo}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("❌ FORM ERRORS:", errors);
          })}
          className="space-y-8"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Project Information
            </h2>
            <BaseProjectForm
              form={form}
              projectId={generatedProjectId}
              isEditMode={isEditMode}
              isContentWriter={isContentWriter}
              isAdmin={isAdmin}
              hideAdminFromDropdown={hideAdminFromDropdown}
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
                  projectId={generatedProjectId}
                />
              )}
              {watchedServiceType === "WD" && (
                <WebsiteDesignForm
                  form={form}
                  isEditMode={isEditMode}
                  existingData={existingProject?.websiteDesign}
                  projectId={generatedProjectId}
                />
              )}
              {watchedServiceType === "CW" && (
                <ContentWritingForm form={form} isEditMode={isEditMode} />
              )}
              {watchedServiceType === "ERP" && (
                <ERPForm
                  form={form}
                  isEditMode={isEditMode}
                  existingData={existingProject?.erp}
                  projectId={generatedProjectId}
                />
              )}

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelServiceForm}
                >
                  Cancel
                </Button>
                
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
