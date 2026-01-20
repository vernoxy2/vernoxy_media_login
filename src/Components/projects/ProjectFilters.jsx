import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../../Components/ui/input';
import { Button } from '../../Components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../Components/ui/select';
import {
  COUNTRY_NAMES,
  SERVICE_NAMES,
  MONTHS,
  YEARS,
} from '../../types/project';
import { useProjects } from '../../context/ProjectContext';

export function ProjectFilters({ filters, onFiltersChange }) {
  const statuses = ['Draft', 'In Progress', 'Review', 'Approved', 'Delivered'];
  const { teamMembers } = useProjects();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchParams] = useSearchParams();
  const serviceFilter = searchParams.get('service');
  useEffect(() => {
    if (serviceFilter) {
      resetFilters();
    }
  }, [serviceFilter]);

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      country: 'all',
      service: 'all',
      status: 'all',
      month: 'all',
      year: 'all',
      assignedTo: 'all',
    });
  };

  const hasActiveFilters =
    filters.country !== 'all' ||
    filters.service !== 'all' ||
    filters.status !== 'all' ||
    filters.month !== 'all' ||
    filters.year !== 'all' ||
    filters.assignedTo !== 'all';

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects, clients, or IDs..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showAdvanced ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              !
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 md:grid-cols-3 lg:grid-cols-6">
          <Select
            value={filters.country}
            onValueChange={(value) => updateFilter('country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {Object.keys(COUNTRY_NAMES).map((code) => (
                <SelectItem key={code} value={code}>
                  {COUNTRY_NAMES[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.service}
            onValueChange={(value) => updateFilter('service', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {Object.keys(SERVICE_NAMES).map((code) => (
                <SelectItem key={code} value={code}>
                  {SERVICE_NAMES[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.month}
            onValueChange={(value) => updateFilter('month', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.year}
            onValueChange={(value) => updateFilter('year', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.assignedTo}
            onValueChange={(value) => updateFilter('assignedTo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}