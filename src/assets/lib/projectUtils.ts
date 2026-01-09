import { Country, ServiceType, Project } from '@/types/project';

// Simulated counter storage (in real app, this would be in database)
const projectCounters: Record<string, number> = {};

export function generateProjectId(
  country: Country,
  service: ServiceType,
  clientCode: string,
  month: string,
  year: string,
  existingProjects: Project[] = []
): string {
  // Get month number (01-12)
  const monthNum = String(getMonthNumber(month)).padStart(2, '0');
  const yearShort = year.slice(-2);
  
  // Create base key for counter
  const baseKey = `${country}-${service}-${clientCode}-${monthNum}${yearShort}`;
  
  // Count existing projects with same pattern
  const existingCount = existingProjects.filter(p => 
    p.projectId.startsWith(baseKey)
  ).length;
  
  // Generate serial number
  const serialNum = String(existingCount + 1).padStart(4, '0');
  
  return `${baseKey}-${serialNum}`;
}

export function getMonthNumber(monthName: string): number {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(monthName) + 1;
}

export function generateClientCode(clientName: string): string {
  // Generate a 3-letter code from client name
  const words = clientName.trim().toUpperCase().split(/\s+/);
  if (words.length >= 3) {
    return words.slice(0, 3).map(w => w[0]).join('');
  } else if (words.length === 2) {
    return words[0][0] + words[1].slice(0, 2);
  } else {
    return words[0].slice(0, 3);
  }
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'Draft': 'status-draft',
    'In Progress': 'status-in-progress',
    'Review': 'status-review',
    'Approved': 'status-approved',
    'Delivered': 'status-delivered',
  };
  return statusMap[status] || 'status-draft';
}

export function getServiceColor(service: ServiceType): string {
  const serviceMap: Record<ServiceType, string> = {
    'CW': 'service-content',
    'GD': 'service-graphic',
    'WD': 'service-website',
    'ERP': 'service-erp',
  };
  return serviceMap[service];
}
