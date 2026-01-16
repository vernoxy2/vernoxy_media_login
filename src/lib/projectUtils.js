// projectUtils.js - Complete Fixed Version

export const generateClientCode = (clientName) => {
  if (!clientName) return "";
  
  const words = clientName.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }
  
  return words
    .slice(0, 3)
    .map(word => word.charAt(0).toUpperCase())
    .join("");
};

export const generateProjectId = (
  country,
  serviceType,
  clientCode,
  month,
  year,
  existingProjects = []
) => {
  if (!country || !serviceType || !clientCode || !month || !year) {
    return "";
  }

  // Month mapping for consistency
  const monthMap = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const monthNumber = monthMap[month];
  const yearShort = year.slice(-2);
  // Base pattern without sequence number
  const basePattern = `${country}-${serviceType}-${clientCode}-${monthNumber}${yearShort}`;
  // ✅ CHANGED: Extract sequence numbers from ALL projects (not just matching ones)
  const allSequenceNumbers = existingProjects
    .map(project => {
      if (!project.projectId) return 0;
      // Use regex to extract the last 4 digits after the final dash
      const match = project.projectId.match(/-(\d{4})$/);
      if (match) {
        return parseInt(match[1], 10);
      }
      return 0;
    })
    .filter(num => num > 0); // Remove any 0s from failed matches
  // Find the highest sequence number across ALL projects
  const maxSequence = allSequenceNumbers.length > 0 
    ? Math.max(...allSequenceNumbers) 
    : 0;
  // Increment for new project
  const newSequence = maxSequence + 1;
  // Format as 4-digit number with leading zeros
  const sequenceFormatted = String(newSequence).padStart(4, '0');
  const finalId = `${basePattern}-${sequenceFormatted}`;
  return finalId;
};

// Status color utility
export const getStatusColor = (status) => {
  const colors = {
    Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    Review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    Delivered: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    Done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  };
  return colors[status] || colors.Draft;
};

// Service color utility
export const getServiceColor = (serviceType) => {
  const colors = {
    GD: "bg-service-graphic/20 text-service-graphic dark:bg-service-graphic/30",
    WD: "bg-service-website/20 text-service-website dark:bg-service-website/30",
    CW: "bg-service-content/20 text-service-content dark:bg-service-content/30",
    ERP: "bg-service-erp/20 text-service-erp dark:bg-service-erp/30",
  };
  return colors[serviceType] || colors.GD;
};