// Simulated counter storage (in real app, this would be in database)
const projectCounters = {};

export function generateProjectId(
  country,
  service,
  clientCode,
  month,
  year,
  existingProjects = []
) {
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

export function getMonthNumber(monthName) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(monthName) + 1;
}

export function generateClientCode(clientName) {
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

export function getStatusColor(status) {
  const statusMap = {
    'Draft': 'status-draft',
    'In Progress': 'status-in-progress',
    'Review': 'status-review',
    'Approved': 'status-approved',
    'Delivered': 'status-delivered',
  };
  return statusMap[status] || 'status-draft';
}

export function getServiceColor(service) {
  const serviceMap = {
    'CW': 'service-content',
    'GD': 'service-graphic',
    'WD': 'service-website',
    'ERP': 'service-erp',
  };
  return serviceMap[service];
}