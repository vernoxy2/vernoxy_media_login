import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjects } from "../context/ProjectContext";
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
  FileText,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById, teamMembers, updateProject } = useProjects();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const project = getProjectById(id || "");

  // Get current user's email from localStorage
  const currentUserEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (project?.notes) {
      setNotes(project.notes);
    }
  }, [project]);

  // Always show buttons if user is logged in
  useEffect(() => {
    if (currentUserEmail && project) {
      console.log("✅ User logged in and project exists - Showing buttons");
      setShowButtons(true);
    } else {
      console.log("❌ Missing user or project - Hiding buttons");
      setShowButtons(false);
    }
  }, [currentUserEmail, project]);

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

  const assignedMember = teamMembers.find((m) => m.id === project.assignedTo);

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
    setIsSubmitting(true);
    try {
      const currentTime = getCurrentTime();
      const updateData = {
        status: "In Progress",
        startTime: currentTime,
        isAccepted: true,
        acceptedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, updateData);
      await updateProject(id, updateData);
      
      toast.success("Project accepted and started!");
    } catch (error) {
      console.error("Error accepting project:", error);
      toast.error("Failed to accept project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = async () => {
    setIsSubmitting(true);
    try {
      const currentTime = getCurrentTime();
      const updateData = {
        status: "Done",
        endTime: currentTime,
        updatedAt: new Date().toISOString(),
      };

      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, updateData);
      await updateProject(id, updateData);
      
      toast.success("Project submitted successfully!");
      
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to submit project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="items-center gap-3">
              <h1 className="font-mono text-2xl font-bold text-foreground">
                {project.projectId}
              </h1>
            </div>
          </div>
        </div>
        
        {/* Accept/Submit Buttons */}
        {showButtons && (
          <div>
            {project.status === "Draft" && (
              <Button 
                onClick={handleAcceptClick}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Accepting..." : "Accept "}
              </Button>
            )}
            
            {project.status === "In Progress" && (
              <Button 
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-700 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit "}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Project Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-3 text-start">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
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
                  <FileText className="h-4 w-4 text-muted-foreground" />
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
              <div>
                <p className="text-sm text-muted-foreground text-start">Status</p>
                <Badge
                  className={cn("status-badge", getStatusColor(project.status))}
                >
                  {project.status}
                </Badge>
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
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium text-foreground">
                    {assignedMember?.name || "Unassigned"}
                  </p>
                </div>
              </div>
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

          {/* Service-specific details */}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity */}
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
              {project.status === "In Progress" && project.startTime && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-foreground">Started at</p>
                    <p className="text-xs text-muted-foreground">
                      {project.startTime}
                    </p>
                  </div>
                </div>
              )}
              {project.status === "Done" && project.endTime && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm text-foreground">Completed at</p>
                    <p className="text-xs text-muted-foreground">
                      {project.endTime}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team */}
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

          {/* Notes Section */}
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