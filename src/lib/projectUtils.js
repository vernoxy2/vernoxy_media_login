// projectUtils.js - Fixed version

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
  
  // Create base pattern for matching
  const basePattern = `${country}-${service}-${clientCode}-${monthNum}${yearShort}`;
  
  // Find all existing projects that match this base pattern
  const matchingProjects = existingProjects.filter(p => 
    p.projectId && p.projectId.startsWith(basePattern)
  );
  
  // Extract sequence numbers from matching projects
  const sequenceNumbers = matchingProjects
    .map(project => {
      const parts = project.projectId.split('-');
      const lastPart = parts[parts.length - 1]; // Get "0001", "0002", etc.
      return parseInt(lastPart, 10);
    })
    .filter(num => !isNaN(num)); // Filter out any invalid numbers
  
  // Find the highest sequence number
  const maxSequence = sequenceNumbers.length > 0 
    ? Math.max(...sequenceNumbers) 
    : 0;
  
  // Increment by 1 for new project
  const newSequence = maxSequence + 1;
  
  // Format as 4 digits with leading zeros
  const serialNum = String(newSequence).padStart(4, '0');
  
  return `${basePattern}-${serialNum}`;
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