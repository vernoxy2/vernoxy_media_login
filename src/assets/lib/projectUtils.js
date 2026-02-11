// // Simulated counter storage (in real app, this would be in database)
// const projectCounters = {};

// // export function generateProjectId(
// //   country,
// //   service,
// //   clientCode,
// //   month,
// //   year,
// //   existingProjects = []
// // ) {
// //   // Get month number (01-12)
// //   const monthNum = String(getMonthNumber(month)).padStart(2, "0");
// //   const yearShort = year.slice(-2);

// //   // Create base key for counter
// //   const baseKey = `${country}-${service}-${clientCode}-${monthNum}${yearShort}`;

// //   // Count existing projects with same pattern
// //   const existingCount = existingProjects.filter((p) =>
// //     p.projectId.startsWith(baseKey)
// //   ).length;

// //   // Generate serial number
// //   const serialNum = String(existingCount + 1).padStart(4, "0");

// //   return `${baseKey}-${serialNum}`;
// // }

// export const generateClientCode = (clientName) => {
//   if (!clientName) return "";
//   const words = clientName.trim().split(/\s+/);
//   if (words.length === 1) {
//     return words[0].substring(0, 3).toUpperCase();
//   }
//   return words
//     .slice(0, 3)
//     .map(word => word.charAt(0).toUpperCase())
//     .join("");
// };

// export const generateProjectId = (
//   country,
//   serviceType,
//   clientCode,
//   month,
//   year,
//   existingProjects = [],
//   isQuickTask = false, // ✅ ADDED THIS PARAMETER
// ) => {
//   if (!country || !serviceType || !clientCode || !month || !year) {
//     return "";
//   }
//   const monthMap = {
//     January: "01",
//     February: "02",
//     March: "03",
//     April: "04",
//     May: "05",
//     June: "06",
//     July: "07",
//     August: "08",
//     September: "09",
//     October: "10",
//     November: "11",
//     December: "12",
//   };

//   const monthNumber = monthMap[month];
//   const yearShort = year.slice(-2);

//   // ✅ ADDED THESE 2 LINES
//   const prefix = isQuickTask ? "QT-" : "";
//   const basePattern = `${prefix}${country}-${serviceType}-${clientCode}-${monthNumber}${yearShort}`;

//   const allSequenceNumbers = existingProjects
//     .map(project => {
//       if (!project.projectId) return 0;
//       const match = project.projectId.match(/-(\d{4})$/);
//       if (match) {
//         return parseInt(match[1], 10);
//       }
//       return 0;
//     })
//     .filter(num => num > 0);
//   const maxSequence = allSequenceNumbers.length > 0 ?
//     Math.max(...allSequenceNumbers) :
//     0;
//   const newSequence = maxSequence + 1;
//   const sequenceFormatted = String(newSequence).padStart(4, '0');
//   const finalId = `${basePattern}-${sequenceFormatted}`;
//   return finalId;
// };

// export const getStatusColor = (status) => {
//   const colors = {
//     Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
//     InProgress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
//     Accepted: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
//     Review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
//     Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
//     Delivered: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
//     Done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
//   };
//   return colors[status] || colors.Draft;
// };

// export const getServiceColor = (serviceType) => {
//   const colors = {
//     GD: "bg-service-graphic/20 text-service-graphic dark:bg-service-graphic/30",
//     WD: "bg-service-website/20 text-service-website dark:bg-service-website/30",
//     CW: "bg-service-content/20 text-service-content dark:bg-service-content/30",
//     ERP: "bg-service-erp/20 text-service-erp dark:bg-service-erp/30",
//   };
//   return colors[serviceType] || colors.GD;
// };
// export function getMonthNumber(monthName) {
//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];
//   return months.indexOf(monthName) + 1;
// }

// export function generateClientCode(clientName) {
//   // Generate a 3-letter code from client name
//   const words = clientName.trim().toUpperCase().split(/\s+/);
//   if (words.length >= 3) {
//     return words
//       .slice(0, 3)
//       .map((w) => w[0])
//       .join("");
//   } else if (words.length === 2) {
//     return words[0][0] + words[1].slice(0, 2);
//   } else {
//     return words[0].slice(0, 3);
//   }
// }

// export function getStatusColor(status) {
//   const statusMap = {
//     Draft: "status-draft",
//     "In Progress": "status-in-progress",
//     Review: "status-review",
//     Approved: "status-approved",
//     Delivered: "status-delivered",
//   };
//   return statusMap[status] || "status-draft";
// }

// export function getServiceColor(service) {
//   const serviceMap = {
//     CW: "service-content",
//     GD: "service-graphic",
//     WD: "service-website",
//     ERP: "service-erp",
//   };
//   return serviceMap[service];
// }

// Generate client code from client name
export const generateClientCode = (clientName) => {
  if (!clientName) return "";
  const words = clientName.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 3 letters
    return words[0].substring(0, 3).toUpperCase();
  }
  
  // Multiple words: take first letter of each (max 3)
  return words
    .slice(0, 3)
    .map(word => word.charAt(0).toUpperCase())
    .join("");
};

// Generate project ID
export const generateProjectId = (
  country,
  serviceType,
  clientCode,
  month,
  year,
  existingProjects = [],
  isQuickTask = false
) => {
  if (!country || !serviceType || !clientCode || !month || !year) {
    return "";
  }

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
  
  // Add QT- prefix for Quick Tasks
  const prefix = isQuickTask ? "QT-" : "";
  const basePattern = `${prefix}${country}-${serviceType}-${clientCode}-${monthNumber}${yearShort}`;
  
  // Find max sequence number from existing projects
  const allSequenceNumbers = existingProjects
    .map(project => {
      if (!project.projectId) return 0;
      const match = project.projectId.match(/-(\d{4})$/);
      if (match) {
        return parseInt(match[1], 10);
      }
      return 0;
    })
    .filter(num => num > 0);
    
  const maxSequence = allSequenceNumbers.length > 0 
    ? Math.max(...allSequenceNumbers) 
    : 0;
    
  const newSequence = maxSequence + 1;
  const sequenceFormatted = String(newSequence).padStart(4, '0');
  const finalId = `${basePattern}-${sequenceFormatted}`;
  
  return finalId;
};

// Get status color classes
export const getStatusColor = (status) => {
  const colors = {
    Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    InProgress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    Accepted: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
    Review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    Delivered: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    Done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  };
  return colors[status] || colors.Draft;
};

// Get service type color classes
export const getServiceColor = (serviceType) => {
  const colors = {
    GD: "bg-service-graphic/20 text-service-graphic dark:bg-service-graphic/30",
    WD: "bg-service-website/20 text-service-website dark:bg-service-website/30",
    CW: "bg-service-content/20 text-service-content dark:bg-service-content/30",
    ERP: "bg-service-erp/20 text-service-erp dark:bg-service-erp/30",
    QT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", // Quick Task color
  };
  return colors[serviceType] || colors.GD;
};