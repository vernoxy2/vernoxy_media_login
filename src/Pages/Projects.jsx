import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { ProjectFilters } from '../Components/projects/ProjectFilters';
import { ProjectList } from '../Components/projects/ProjectList';
import { Button } from '../Components/ui/button';
import { Plus } from 'lucide-react';

export default function Projects() {
  const { projects } = useProjects();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: '',
    country: 'all',
    service: 'all',
    status: 'all',
    month: 'all',
    year: 'all',
    assignedTo: 'all',
  });

  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      setFilters(prev => ({ ...prev, service: serviceParam }));
    } else {
      setFilters(prev => ({ ...prev, service: 'all' }));
    }
  }, [searchParams]);

  const serviceBasedTotal = useMemo(() => {
    if (filters.service === 'all') {
      return projects.length;
    }
    return projects.filter(project => project.serviceType === filters.service).length;
  }, [projects, filters.service]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          project.projectId.toLowerCase().includes(searchLower) ||
          project.clientName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Other filters
      if (filters.country !== 'all' && project.country !== filters.country) return false;
      if (filters.service !== 'all' && project.serviceType !== filters.service) return false;
      if (filters.status !== 'all' && project.status !== filters.status) return false;
      if (filters.month !== 'all' && project.month !== filters.month) return false;
      if (filters.year !== 'all' && project.year !== filters.year) return false;
      if (filters.assignedTo !== 'all' && project.assignedTo !== filters.assignedTo) return false;

      return true;
    });
  }, [projects, filters]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects 
          </p>
        </div>
        <Link to="/admin/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ProjectFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Project List */}
      <ProjectList projects={filteredProjects} />
    </div>
  );
}