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
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react";

const projectSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  country: z.string().min(1, "Country is required"),
  serviceType: z.string().min(1, "Service type is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  status: z.string().default("Draft"),
  assignedTo: z.string().optional(),
  internalNotes: z.string().optional(),
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
    .optional(),
  websiteDesign: z
    .object({
      websiteType: z.string().optional(),
      numberOfPages: z.string().optional(),
      technologyPreference: z.string().optional(),
      referenceWebsites: z.string().optional(),
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
                })
              )
              .optional(),
          })
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
  const { projects, addProject, updateProject, getProjectById, loading } =
    useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldData, setShowOldData] = useState(false);

  // Check if we're in edit mode based on URL parameter
  const isEditMode = Boolean(id);
  const existingProject = isEditMode ? getProjectById(id) : null;

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

  // Load existing project data when in edit mode
  useEffect(() => {
    if (isEditMode && existingProject) {
      form.reset({
        clientName: existingProject.clientName || "",
        country: existingProject.country || "",
        serviceType: existingProject.serviceType || "",
        month: existingProject.month || "",
        year: existingProject.year || "",
        status: existingProject.status || "Draft",
        assignedTo: existingProject.assignedTo || "",
        internalNotes: existingProject.internalNotes || "",
        graphicDesign: existingProject.graphicDesign || {
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
    }
  }, [isEditMode, existingProject, form]);

  // Watch form fields for dynamic updates
  const watchedServiceType = form.watch("serviceType");
  const watchedClientName = form.watch("clientName");
  const watchedCountry = form.watch("country");
  const watchedMonth = form.watch("month");
  const watchedYear = form.watch("year");

  // Generate project ID automatically
  const generatedProjectId = useMemo(() => {
    if (isEditMode && existingProject) {
      return existingProject.projectId;
    }

    if (
      !watchedCountry ||
      !watchedServiceType ||
      !watchedClientName ||
      !watchedMonth ||
      !watchedYear
    ) {
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

  // Handle form submission
const onSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    if (isEditMode) {
      const updatedProject = {
        ...existingProject,
        status: data.status,
        internalNotes: data.internalNotes || "",
      };

      // Update mainText and subText updates
      Object.keys(data.graphicDesign || {}).forEach(key => {
        if (key.startsWith('mainText') || key.startsWith('subText')) {
          if (!updatedProject.graphicDesign) {
            updatedProject.graphicDesign = {};
          }
          updatedProject.graphicDesign[key] = data.graphicDesign[key];
        }
      });

      await updateProject(id, updatedProject);
      navigate(`/admin/projects/${id}`);
    } else {
      const newProject = {
        projectId: generatedProjectId,
        clientName: data.clientName,
        country: data.country,
        serviceType: data.serviceType,
        month: data.month,
        year: data.year,
        status: data.status,
        assignedTo: data.assignedTo || "",
        internalNotes: data.internalNotes || "",
        graphicDesign: data.serviceType === "GD" ? {
          // Basic fields
          postType: data.graphicDesign?.postType || "",
          platform: data.graphicDesign?.platform || "",
          size: data.graphicDesign?.size || "",
          mainText: data.graphicDesign?.mainText || "",
          subText: data.graphicDesign?.subText || "",
          ctaText: data.graphicDesign?.ctaText || "",
          hashtags: data.graphicDesign?.hashtags || "",
          caption: data.graphicDesign?.caption || "",
          designerNotes: data.graphicDesign?.designerNotes || "",
          ...Object.keys(data.graphicDesign || {})
            .filter(key => key.startsWith('mainText') && key !== 'mainText')
            .reduce((acc, key) => ({ ...acc, [key]: data.graphicDesign[key] }), {}),
          ...Object.keys(data.graphicDesign || {})
            .filter(key => key.startsWith('subText') && key !== 'subText')
            .reduce((acc, key) => ({ ...acc, [key]: data.graphicDesign[key] }), {}),
        } : null,
        websiteDesign: data.serviceType === "WD" ? data.websiteDesign : null,
        contentWriting: data.serviceType === "CW" ? data.contentWriting : null,
        erp: data.serviceType === "ERP" ? data.erp : null,
      };

      await addProject(newProject);
      navigate("/admin/projects");
    }
  } catch (error) {
    console.error("Error submitting project:", error);
    alert("Error saving project. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error if project not found in edit mode
  if (isEditMode && !existingProject) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-start">
      {/* Page Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? "Edit Project" : "New Project"}
          </h1>
          <p className="text-muted-foreground text-md">
            {isEditMode
              ? `Update project status and notes for ${existingProject?.projectId}`
              : "Create a new project with all required details"}
          </p>
        </div>
        {/* Toggle button to show/hide old data summary */}
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

      {/* Expandable section showing current project data in edit mode */}
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
                  Service Type:
                </span>
                <p className="text-blue-800 dark:text-blue-300">
                  {existingProject.serviceType}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  Country:
                </span>
                <p className="text-blue-800 dark:text-blue-300">
                  {existingProject.country}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  Month:
                </span>
                <p className="text-blue-800 dark:text-blue-300">
                  {existingProject.month}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  Year:
                </span>
                <p className="text-blue-800 dark:text-blue-300">
                  {existingProject.year}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Base Project Information Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Project Information
            </h2>
            <BaseProjectForm
              form={form}
              projectId={generatedProjectId}
              isEditMode={isEditMode}
            />
          </div>

          {/* Service-specific forms - shown based on service type */}
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

          {/* Form action buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Project" : "Create Project"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
