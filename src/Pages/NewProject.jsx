import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '../Components/ui/form';
import { Button } from '../Components/ui/button';
import { BaseProjectForm } from '../Components/projects/forms/BaseProjectForm';
import { GraphicDesignForm } from '../Components/projects/forms/GraphicDesignForm';
import { WebsiteDesignForm } from '../Components/projects/forms/WebsiteDesignForm';
import { ContentWritingForm } from '../Components/projects/forms/ContentWritingForm';
import { ERPForm } from '../Components/projects/forms/ERPForm';
import { useProjects } from '../context/ProjectContext';
import { generateProjectId, generateClientCode } from '../lib/projectUtils';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const projectSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  country: z.string().min(1, 'Country is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.string().min(1, 'Year is required'),
  status: z.string().default('Draft'),
  assignedTo: z.string().optional(),
  internalNotes: z.string().optional(),
  graphicDesign: z.object({
    postType: z.string().optional(),
    platform: z.string().optional(),
    size: z.string().optional(),
    mainText: z.string().optional(),
    subText: z.string().optional(),
    ctaText: z.string().optional(),
    hashtags: z.string().optional(),
    designerNotes: z.string().optional(),
  }).optional(),
  websiteDesign: z.object({
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
  }).optional(),
  contentWriting: z.object({
    contentType: z.string().optional(),
    wordCount: z.string().optional(),
    tone: z.string().optional(),
    mainContent: z.string().optional(),
    cta: z.string().optional(),
    seoKeywords: z.string().optional(),
    reviewNotes: z.string().optional(),
  }).optional(),
  erp: z.object({
    erpType: z.string().optional(),
    modulesRequired: z.array(z.string()).optional(),
    workflowDescription: z.string().optional(),
    userRoles: z.string().optional(),
    integrationsRequired: z.string().optional(),
    technicalNotes: z.string().optional(),
  }).optional(),
});

export default function NewProject() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if editing
  const { projects, addProject, updateProject, getProjectById } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we're in edit mode
  const isEditMode = Boolean(id);
  const existingProject = isEditMode ? getProjectById(id) : null;

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientName: '',
      country: '',
      serviceType: '',
      month: '',
      year: '',
      status: 'Draft',
      assignedTo: '',
      internalNotes: '',
      graphicDesign: {},
      websiteDesign: { pages: [] },
      contentWriting: {},
      erp: { modulesRequired: [] },
    },
  });

  // Load existing project data when in edit mode
  useEffect(() => {
    if (isEditMode && existingProject) {
      form.reset({
        clientName: existingProject.clientName || '',
        country: existingProject.country || '',
        serviceType: existingProject.serviceType || '',
        month: existingProject.month || '',
        year: existingProject.year || '',
        status: existingProject.status || 'Draft',
        assignedTo: existingProject.assignedTo || '',
        internalNotes: existingProject.internalNotes || '',
        graphicDesign: existingProject.graphicDesign || {},
        websiteDesign: existingProject.websiteDesign || { pages: [] },
        contentWriting: existingProject.contentWriting || {},
        erp: existingProject.erp || { modulesRequired: [] },
      });
    }
  }, [isEditMode, existingProject, form]);

  const watchedServiceType = form.watch('serviceType');
  const watchedClientName = form.watch('clientName');
  const watchedCountry = form.watch('country');
  const watchedMonth = form.watch('month');
  const watchedYear = form.watch('year');

  const generatedProjectId = useMemo(() => {
    // If editing, use existing project ID
    if (isEditMode && existingProject) {
      return existingProject.projectId;
    }

    // If creating new, generate ID
    if (!watchedCountry || !watchedServiceType || !watchedClientName || !watchedMonth || !watchedYear) {
      return '';
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
  }, [isEditMode, existingProject, watchedCountry, watchedServiceType, watchedClientName, watchedMonth, watchedYear, projects]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Update existing project
        const updatedProject = {
          ...existingProject,
          clientName: data.clientName,
          country: data.country,
          serviceType: data.serviceType,
          month: data.month,
          year: data.year,
          status: data.status,
          assignedTo: data.assignedTo || '',
          internalNotes: data.internalNotes || '',
          updatedAt: new Date(),
          ...(data.serviceType === 'GD' && data.graphicDesign && { graphicDesign: data.graphicDesign }),
          ...(data.serviceType === 'WD' && data.websiteDesign && { websiteDesign: data.websiteDesign }),
          ...(data.serviceType === 'CW' && data.contentWriting && { contentWriting: data.contentWriting }),
          ...(data.serviceType === 'ERP' && data.erp && { erp: data.erp }),
        };

        updateProject(id, updatedProject);
        toast.success('Project updated successfully!');
        navigate(`/admin/projects/${id}`);
      } else {
        // Create new project
        const newProject = {
          id: crypto.randomUUID(),
          projectId: generatedProjectId,
          clientName: data.clientName,
          country: data.country,
          serviceType: data.serviceType,
          month: data.month,
          year: data.year,
          status: data.status,
          assignedTo: data.assignedTo || '',
          internalNotes: data.internalNotes || '',
          attachments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(data.serviceType === 'GD' && data.graphicDesign && { graphicDesign: data.graphicDesign }),
          ...(data.serviceType === 'WD' && data.websiteDesign && { websiteDesign: data.websiteDesign }),
          ...(data.serviceType === 'CW' && data.contentWriting && { contentWriting: data.contentWriting }),
          ...(data.serviceType === 'ERP' && data.erp && { erp: data.erp }),
        };

        addProject(newProject);
        toast.success('Project created successfully!');
        navigate('/admin/projects');
      }
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update project' : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading or not found state when editing
  if (isEditMode && !existingProject) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-start">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? `Update project details for ${existingProject?.projectId}` 
              : 'Create a new project with all required details'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Base Project Fields */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Project Information</h2>
            <BaseProjectForm form={form} projectId={generatedProjectId} />
          </div>

          {/* Dynamic Service Forms */}
          {watchedServiceType === 'GD' && <GraphicDesignForm form={form} />}
          {watchedServiceType === 'WD' && <WebsiteDesignForm form={form} />}
          {watchedServiceType === 'CW' && <ContentWritingForm form={form} />}
          {watchedServiceType === 'ERP' && <ERPForm form={form} />}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting 
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Project' : 'Create Project')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}