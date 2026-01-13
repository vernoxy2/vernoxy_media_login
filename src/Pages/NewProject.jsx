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
import { ArrowLeft, Save, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

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
  const [duplicateNameWarning, setDuplicateNameWarning] = useState("");
  
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

  // Check for duplicate client names
  useEffect(() => {
    if (!isEditMode && watchedClientName) {
      const normalizedNewName = watchedClientName.trim().toLowerCase();
      const duplicateProject = projects.find(
        (project) => project.clientName.trim().toLowerCase() === normalizedNewName
      );

      if (duplicateProject) {
        setDuplicateNameWarning(
          `⚠️ A project with client name "${duplicateProject.clientName}" already exists (ID: ${duplicateProject.projectId}). Please use a different name.`
        );
      } else {
        setDuplicateNameWarning("");
      }
    }
  }, [watchedClientName, projects, isEditMode]);

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

    // Block creation if duplicate name exists
    if (duplicateNameWarning) {
      alert("Cannot create project: A project with this client name already exists. Please use a different name.");
      return;
    }

    const currentTime = getCurrentTime();
    form.setValue("startTime", currentTime);
    setShowServiceForm(true);
  };

  const onSubmit = async (data) => {
    // Final check for duplicate name before submission
    if (!isEditMode && duplicateNameWarning) {
      alert("Cannot submit project: A project with this client name already exists. Please use a different name.");
      return;
    }

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

      {/* Duplicate Name Warning */}
      {duplicateNameWarning && (
        <div className="mb-6 rounded-xl border border-red-500/50 bg-red-50 dark:bg-red-950/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Duplicate Client Name Detected
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                {duplicateNameWarning}
              </p>
            </div>
          </div>
        </div>
      )}

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
            />
            {!isEditMode && !showServiceForm && (
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={handleCreateProject}
                  className="bg-primary hover:bg-primary/90"
                  disabled={!!duplicateNameWarning}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </div>
            )}
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
                <Button type="submit" disabled={isSubmitting || !!duplicateNameWarning}>
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