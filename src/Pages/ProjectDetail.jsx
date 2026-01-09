import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext'
import { SERVICE_NAMES, COUNTRY_NAMES } from '../types/project';
import { getStatusColor, getServiceColor } from '../lib/projectUtils';
import { Button } from '../Components/ui/button';
import { Badge } from '../Components/ui/badge';
import { Separator } from '../Components/ui/separator';
import { ArrowLeft, Edit, Calendar, User, Globe, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById, teamMembers } = useProjects();

  const project = getProjectById(id || '');

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

  const assignedMember = teamMembers.find(m => m.id === project.assignedTo);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Handler to navigate to edit page
  const handleEditClick = () => {
    navigate(`/admin/projects/edit/${id}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl font-bold text-foreground">{project.projectId}</h1>
              <Badge className={cn('status-badge', getStatusColor(project.status))}>
                {project.status}
              </Badge>
            </div>
            <p className="mt-1 text-lg text-muted-foreground">{project.clientName}</p>
          </div>
        </div>
        <Button onClick={handleEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Project
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Project Overview</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium text-foreground">{COUNTRY_NAMES[project.country]}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <Badge className={cn('service-badge', getServiceColor(project.serviceType))}>
                    {SERVICE_NAMES[project.serviceType]}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium text-foreground">{project.month} {project.year}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium text-foreground">
                    {assignedMember?.name || 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>

            {project.internalNotes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Internal Notes</p>
                  <p className="text-foreground">{project.internalNotes}</p>
                </div>
              </>
            )}
          </div>

          {/* Service-specific details */}
          {project.serviceType === 'GD' && project.graphicDesign && (
            <div className="rounded-xl border border-service-graphic/20 bg-service-graphic/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-service-graphic" />
                Graphic Design Details
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Post Type</p>
                  <p className="font-medium text-foreground">{project.graphicDesign.postType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium text-foreground">{project.graphicDesign.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium text-foreground">{project.graphicDesign.size}</p>
                </div>
              </div>
              {project.graphicDesign.mainText && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Main Text</p>
                  <p className="font-medium text-foreground">{project.graphicDesign.mainText}</p>
                </div>
              )}
              {project.graphicDesign.ctaText && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">CTA</p>
                  <p className="font-medium text-foreground">{project.graphicDesign.ctaText}</p>
                </div>
              )}
            </div>
          )}

          {project.serviceType === 'WD' && project.websiteDesign && (
            <div className="rounded-xl border border-service-website/20 bg-service-website/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-service-website" />
                Website Design Details
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Website Type</p>
                  <p className="font-medium text-foreground">{project.websiteDesign.websiteType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number of Pages</p>
                  <p className="font-medium text-foreground">{project.websiteDesign.numberOfPages}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Technology</p>
                  <p className="font-medium text-foreground">{project.websiteDesign.technologyPreference || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {project.serviceType === 'CW' && project.contentWriting && (
            <div className="rounded-xl border border-service-content/20 bg-service-content/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-service-content" />
                Content Writing Details
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Content Type</p>
                  <p className="font-medium text-foreground">{project.contentWriting.contentType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Word Count</p>
                  <p className="font-medium text-foreground">{project.contentWriting.wordCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tone</p>
                  <p className="font-medium text-foreground">{project.contentWriting.tone}</p>
                </div>
              </div>
            </div>
          )}

          {project.serviceType === 'ERP' && project.erp && (
            <div className="rounded-xl border border-service-erp/20 bg-service-erp/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <div className="h-2 w-2 rounded-full bg-service-erp" />
                ERP Development Details
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">ERP Type</p>
                  <p className="font-medium text-foreground">{project.erp.erpType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Integrations</p>
                  <p className="font-medium text-foreground">{project.erp.integrationsRequired || 'None'}</p>
                </div>
              </div>
              {project.erp.modulesRequired && project.erp.modulesRequired.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Modules</p>
                  <div className="flex flex-wrap gap-2">
                    {project.erp.modulesRequired.map((module) => (
                      <Badge key={module} variant="secondary">{module}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm text-foreground">Project created</p>
                  <p className="text-xs text-muted-foreground">{formatDate(project.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">Last updated</p>
                  <p className="text-xs text-muted-foreground">{formatDate(project.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          {assignedMember && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Team Member</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {assignedMember.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-foreground">{assignedMember.name}</p>
                  <p className="text-sm text-muted-foreground">{assignedMember.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}