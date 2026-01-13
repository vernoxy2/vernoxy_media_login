import React, { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Building2,
  AlertCircle,
  Package,
  DollarSign,
  Download,
} from "lucide-react";
import PrimaryBtn from "../../../Components/PrimartyBtn";
import BottomLine from "../../../Components/BottomLine";
import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaAngleDown } from "react-icons/fa";

export default function ERPForm() {
  const [currentStage, setCurrentStage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    plantLocations: "",
    industryType: "",
    contactPerson: "",
    designation: "",
    phone: "",
    email: "",
    manufacturingType: [],
    numberOfMachines: "",
    numberOfShifts: "",
    approxManpower: "",
    currentSystem: [],
    otherERP: "",
    painPoints: [],
    otherPainPoint: "",
    productionJobCards: "",
    productionType: "",
    rejectionTracking: "",
    rawMaterialTracking: "",
    barcodeRequired: "",
    lotTracking: "",
    orderTracking: "",
    deliverySchedule: "",
    invoiceIntegration: "",
    dailyReport: false,
    shiftReport: false,
    machineEfficiency: false,
    dashboard: false,
    numberOfUsers: "",
    numberOfPlants: "",
    deployment: "",
    customFeatures: "",
    goLiveTimeline: "",
    leadStatus: "New",
    priority: "Medium",
  });
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
  });
  const stages = [
    { num: 1, title: "Basic Inquiry", icon: Building2 },
    { num: 2, title: "Pain Points", icon: AlertCircle },
    { num: 3, title: "Module Requirements", icon: Package },
    { num: 4, title: "Commercial Details", icon: DollarSign },
  ];
  if (typeof window !== "undefined" && window.emailjs) {
    window.emailjs.init("cLTlOnc9Qs3zghUUK");
  }

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const nextStage = () => {
    if (currentStage === 1) {
      if (validateStage1()) {
        setCurrentStage(currentStage + 1);
      }
    } else {
      if (currentStage < 4) setCurrentStage(currentStage + 1);
    }
  };
  const prevStage = () => {
    if (currentStage > 1) setCurrentStage(currentStage - 1);
  };

  const generatePDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;
    const lineHeight = 6;
    const pageHeight = 280;
    const leftMargin = 20;
    const rightMargin = 190;

    // Helper function to check and add page break
    const checkPageBreak = (spaceNeeded = 10) => {
      if (y + spaceNeeded > pageHeight) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Helper function to add wrapped text
    const addWrappedText = (text, isBold = false) => {
      if (!text || text === "undefined" || text === "null") text = "N/A";
      const lines = doc.splitTextToSize(text, rightMargin - leftMargin);
      lines.forEach((line) => {
        checkPageBreak(lineHeight);
        doc.setFont(undefined, isBold ? "bold" : "normal");
        doc.text(line, leftMargin, y);
        y += lineHeight;
      });
    };

    // Get current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Add date and time in top right corner
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Date: ${dateStr}`, 200, 15, { align: "right" });
    doc.text(`Time: ${timeStr}`, 200, 20, { align: "right" });

    // Reset text color for header
    doc.setTextColor(0, 0, 0);

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("ERP Customer Requirement Capture", 105, y, { align: "center" });
    y += 15;

    // ========== STAGE 1 ==========
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Stage 1: Basic Inquiry Details", leftMargin, y);
    y += 10;

    doc.setFontSize(10);
    addWrappedText(`Company Name: ${formData.companyName}`);
    addWrappedText(`Plant Locations: ${formData.plantLocations}`);
    addWrappedText(`Industry Type: ${formData.industryType}`);
    addWrappedText(
      `Contact Person: ${formData.contactPerson} (${formData.designation})`
    );
    addWrappedText(`Phone: ${formData.phone}`);
    addWrappedText(`Email: ${formData.email}`);
    addWrappedText(
      `Manufacturing Type: ${formData.manufacturingType.join(", ")}`
    );
    addWrappedText(`Number of Machines: ${formData.numberOfMachines}`);
    addWrappedText(`Number of Shifts: ${formData.numberOfShifts}`);
    addWrappedText(`Approx. Manpower: ${formData.approxManpower}`);
    y += 8;

    // ========== STAGE 2 ==========
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Stage 2: Current System & Pain Points", leftMargin, y);
    y += 10;

    doc.setFontSize(10);
    addWrappedText(`Current System: ${formData.currentSystem.join(", ")}`);

    if (formData.otherERP) {
      addWrappedText(`ERP Name: ${formData.otherERP}`);
    }

    addWrappedText(`Pain Points: ${formData.painPoints.join(", ")}`);

    if (formData.otherPainPoint) {
      addWrappedText(`Other Pain Points: ${formData.otherPainPoint}`);
    }
    y += 8;

    // ========== STAGE 3 ==========
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Stage 3: Module Requirements", leftMargin, y);
    y += 10;

    doc.setFontSize(10);
    addWrappedText(`Job Cards Required: ${formData.productionJobCards}`);
    addWrappedText(`Production Type: ${formData.productionType}`);
    addWrappedText(`Rejection Tracking: ${formData.rejectionTracking}`);
    addWrappedText(`Raw Material Tracking: ${formData.rawMaterialTracking}`);
    addWrappedText(`Barcode Required: ${formData.barcodeRequired}`);
    addWrappedText(`Lot/Batch Tracking: ${formData.lotTracking}`);
    addWrappedText(`Order Tracking: ${formData.orderTracking}`);
    addWrappedText(`Delivery Schedule: ${formData.deliverySchedule}`);
    addWrappedText(`Invoice Integration: ${formData.invoiceIntegration}`);

    const reports = [
      formData.dailyReport && "Daily Report",
      formData.shiftReport && "Shift Report",
      formData.machineEfficiency && "Machine Efficiency",
      formData.dashboard && "Dashboard",
    ]
      .filter(Boolean)
      .join(", ");
    addWrappedText(`Reports Required: ${reports || "None"}`);
    y += 8;

    // ========== STAGE 4 ==========
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Stage 4: Commercial & Customization", leftMargin, y);
    y += 10;

    doc.setFontSize(10);
    addWrappedText(`Number of Users: ${formData.numberOfUsers}`);
    addWrappedText(`Number of Plants: ${formData.numberOfPlants}`);
    addWrappedText(`Deployment Preference: ${formData.deployment}`);

    // Custom features with proper wrapping
    if (formData.customFeatures && formData.customFeatures.trim() !== "") {
      checkPageBreak(20);
      doc.setFont(undefined, "bold");
      doc.text("Custom Features:", leftMargin, y);
      y += lineHeight;
      doc.setFont(undefined, "normal");
      addWrappedText(formData.customFeatures);
    }

    addWrappedText(`Go-Live Timeline: ${formData.goLiveTimeline}`);
    addWrappedText(`Lead Status: ${formData.leadStatus}`);
    addWrappedText(`Priority: ${formData.priority}`);

    // Add footer on last page
    y += 10;
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont(undefined, "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Generated by ERP Form System", leftMargin, y);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin, y + 5);

    return doc;
  };

  // const downloadPDF = () => {
  //   const doc = generatePDF();
  //   doc.save(`${formData.companyName || "customer"}_ERP_requirements.pdf`);
  // };

  const submitAndEmail = async () => {
    if (!validateStage1()) {
      setSubmitStatus({
        type: "error",
        message:
          "⚠️ Please complete all required fields in Stage 1 (Basic Information) before submitting.",
      });
      setCurrentStage(1); // Navigate user back to Stage 1
      return; // Exit early if validation fails
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      // Step 1: Save to Firestore FIRST
      const submissionData = {
        // Basic Information
        companyName: formData.companyName,
        plantLocations: formData.plantLocations,
        industryType: formData.industryType,
        contactPerson: formData.contactPerson,
        designation: formData.designation,
        phone: formData.phone,
        email: formData.email,

        // Manufacturing Details
        manufacturingType: formData.manufacturingType,
        numberOfMachines: formData.numberOfMachines,
        numberOfShifts: formData.numberOfShifts,
        approxManpower: formData.approxManpower,

        // Current System
        currentSystem: formData.currentSystem,
        otherERP: formData.otherERP,
        painPoints: formData.painPoints,
        otherPainPoint: formData.otherPainPoint,

        // Module Requirements
        productionJobCards: formData.productionJobCards,
        productionType: formData.productionType,
        rejectionTracking: formData.rejectionTracking,
        rawMaterialTracking: formData.rawMaterialTracking,
        barcodeRequired: formData.barcodeRequired,
        lotTracking: formData.lotTracking,
        orderTracking: formData.orderTracking,
        deliverySchedule: formData.deliverySchedule,
        invoiceIntegration: formData.invoiceIntegration,

        // Reports
        dailyReport: formData.dailyReport,
        shiftReport: formData.shiftReport,
        machineEfficiency: formData.machineEfficiency,
        dashboard: formData.dashboard,

        // Commercial Details
        numberOfUsers: formData.numberOfUsers,
        numberOfPlants: formData.numberOfPlants,
        deployment: formData.deployment,
        customFeatures: formData.customFeatures,
        goLiveTimeline: formData.goLiveTimeline,

        // Lead Management
        leadStatus: formData.leadStatus,
        priority: formData.priority,

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submissionStatus: "new",
      };
      const docRef = await addDoc(
        collection(db, "erpSubmissions"),
        submissionData
      );
      const doc = generatePDF();
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      const formDataToSend = new FormData();
      formDataToSend.append("pdfData", pdfBase64);
      formDataToSend.append("firestoreId", docRef.id);
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("plantLocations", formData.plantLocations);
      formDataToSend.append("industryType", formData.industryType);
      formDataToSend.append("contactPerson", formData.contactPerson);
      formDataToSend.append("designation", formData.designation);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("email", formData.email);
      formDataToSend.append(
        "manufacturingType",
        formData.manufacturingType.join(", ")
      );
      formDataToSend.append("numberOfMachines", formData.numberOfMachines);
      formDataToSend.append("numberOfShifts", formData.numberOfShifts);
      formDataToSend.append("approxManpower", formData.approxManpower);
      formDataToSend.append("currentSystem", formData.currentSystem.join(", "));
      formDataToSend.append("otherERP", formData.otherERP);
      formDataToSend.append("painPoints", formData.painPoints.join(", "));
      formDataToSend.append("otherPainPoint", formData.otherPainPoint);
      formDataToSend.append("productionJobCards", formData.productionJobCards);
      formDataToSend.append("productionType", formData.productionType);
      formDataToSend.append("rejectionTracking", formData.rejectionTracking);
      formDataToSend.append(
        "rawMaterialTracking",
        formData.rawMaterialTracking
      );
      formDataToSend.append("barcodeRequired", formData.barcodeRequired);
      formDataToSend.append("lotTracking", formData.lotTracking);
      formDataToSend.append("orderTracking", formData.orderTracking);
      formDataToSend.append("deliverySchedule", formData.deliverySchedule);
      formDataToSend.append("invoiceIntegration", formData.invoiceIntegration);
      formDataToSend.append("numberOfUsers", formData.numberOfUsers);
      formDataToSend.append("numberOfPlants", formData.numberOfPlants);
      formDataToSend.append("deployment", formData.deployment);
      formDataToSend.append("customFeatures", formData.customFeatures);
      formDataToSend.append("goLiveTimeline", formData.goLiveTimeline);
      formDataToSend.append("leadStatus", formData.leadStatus);
      formDataToSend.append("priority", formData.priority);

      // Step 4: Send to Google Apps Script
      const GOOGLE_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbxbiVFSZoz2to_AfZJtDgJ5ecaj90NhKWDTJOHOjPUYJAWb7Pswy6JMeZ0u3v4uRWqc/exec";

      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: formDataToSend,
        mode: "no-cors",
      }).catch((err) =>
        console.log("❌ Email notification failed (non-critical):", err)
      );

      console.log("✅ All operations completed");

      // Show success
      setSubmitStatus({
        type: "success",
        message:
          "✅ Thank you! Your requirements have been submitted successfully. Our team will contact you shortly.",
      });
      setFormData({
        companyName: "",
        plantLocations: "",
        industryType: "",
        contactPerson: "",
        designation: "",
        phone: "",
        email: "",
        manufacturingType: [],
        numberOfMachines: "",
        numberOfShifts: "",
        approxManpower: "",
        currentSystem: [],
        otherERP: "",
        painPoints: [],
        otherPainPoint: "",
        productionJobCards: "",
        productionType: "",
        rejectionTracking: "",
        rawMaterialTracking: "",
        barcodeRequired: "",
        lotTracking: "",
        orderTracking: "",
        deliverySchedule: "",
        invoiceIntegration: "",
        dailyReport: false,
        shiftReport: false,
        machineEfficiency: false,
        dashboard: false,
        numberOfUsers: "",
        numberOfPlants: "",
        deployment: "",
        customFeatures: "",
        goLiveTimeline: "",
        leadStatus: "New",
        priority: "Medium",
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error("❌ Submission Error:", error);
      console.error("❌ Error name:", error.name);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);

      setSubmitStatus({
        type: "error",
        message: `❌ There was an error submitting your data: ${error.message}. Please try downloading the PDF instead or contact us directly at vernoxy3@gmail.com`,
      });
      setIsSubmitting(false);
    }
  };

  const validateRequired = (value, fieldName) => {
    if (!value || !value.trim()) {
      return `${fieldName} is required`;
    }
    return "";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10,15}$/;
    if (!phone) {
      return "Phone number is required";
    }
    if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
      return "Phone number must be 10-15 digits only";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Common validation function for Stage 1
  const validateStage1 = () => {
    const newErrors = {
      companyName: validateRequired(formData.companyName, "Company Name"),
      contactPerson: validateRequired(formData.contactPerson, "Contact Person"),
      phone: validatePhone(formData.phone),
      email: validateEmail(formData.email),
    };

    setErrors({ ...errors, ...newErrors });

    // Check if any errors exist
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Update handleInputChange to validate individual fields
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Validate based on field type
    let error = "";
    switch (field) {
      case "companyName":
        error = validateRequired(value, "Company Name");
        break;
      case "contactPerson":
        error = validateRequired(value, "Contact Person");
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      default:
        break;
    }

    setErrors({ ...errors, [field]: error });
  };

  return (
    <section className="container py-20 relative">
      {/* Progress Indicator */}
      <div className="bg-[#464646]/50 backdrop-blur-md rounded-lg p-6 mb-10 border border-primary/30">
        <div className="flex justify-between items-center">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = currentStage === stage.num;
            const isCompleted = currentStage > stage.num;
            return (
              <React.Fragment key={stage.num}>
                <div
                  className="flex flex-col items-center flex-1 cursor-pointer"
                  onClick={() => setCurrentStage(stage.num)}
                >
                  <div
                    className={`w-6 md:w-12 h-6 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-r from-primary to-white text-black"
                        : isActive
                        ? "bg-gradient-to-r from-primary to-white text-black scale-110"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className=" w-4 md:w-6 h-6" />
                    ) : (
                      <Icon className=" w-4 md:w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-xs md:text-sm text-center font-bold font-Bai_Jamjuree ${
                      isActive ? "text-primary" : "text-white"
                    }`}
                  >
                    {stage.title}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                      currentStage > stage.num
                        ? "bg-gradient-to-r from-primary to-white"
                        : "bg-gray-700"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-[#464646]/50 backdrop-blur-md rounded-lg p-6 md:p-10 mb-10 border border-primary/20">
        {/* Stage 1 */}
        {currentStage === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold font-Bai_Jamjuree text-primary mb-2">
                Stage 1: Basic Inquiry Details
              </h2>
              <p className="text-gray-300 mb-4">
                Pre-qualification information to understand your business
              </p>
              <BottomLine className="mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-start">
              <div>
                <label className="block font-medium text-white/90 mb-2 ">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className={`input-style placeholder-white/50 w-full ${
                    errors.companyName ? "border-red-500" : ""
                  }`}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium text-white/90 mb-2">
                  Plant Locations
                </label>
                <input
                  type="text"
                  value={formData.plantLocations}
                  onChange={(e) =>
                    handleInputChange("plantLocations", e.target.value)
                  }
                  className={`input-style placeholder-white/50 w-full ${
                    errors.contactPerson ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., Mumbai, Pune"
                />
              </div>
              <div>
                <label className="block font-medium text-white/90 mb-2">
                  Industry Type
                </label>
                <div className="relative w-full">
                  <select
                    value={formData.industryType}
                    onChange={(e) =>
                      handleInputChange("industryType", e.target.value)
                    }
                    className={`input-style w-full appearance-none pr-10 ${
                      formData.industryType
                        ? "text-white focus:text-black"
                        : "text-white/50 focus:text-black"
                    }`}
                  >
                    <option value="" disabled>
                      Select industry
                    </option>
                    <option value="Plastic">Plastic</option>
                    <option value="Pharma">Pharma</option>
                    <option value="Textile">Textile</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Other">Other</option>
                  </select>

                  <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-white/90 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    handleInputChange("contactPerson", e.target.value)
                  }
                  className="input-style w-full placeholder-white/50"
                  placeholder="Full name"
                />
                {errors.contactPerson && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contactPerson}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium text-text-white/90 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    handleInputChange("designation", e.target.value)
                  }
                  className="input-style w-full placeholder-white/50"
                  placeholder="e.g., Production Manager"
                />
              </div>
              <div>
                <label className="block font-medium text-white mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  // onChange={(e) => handleInputChange("phone", e.target.value)}
                  onChange={(e) => {
                    // Remove non-digit characters
                    const value = e.target.value.replace(/\D/g, "");
                    handleInputChange("phone", value);
                  }}
                  className="input-style w-full placeholder-white/50"
                  placeholder="+91 XXXXX XXXXX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium text-text mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="input-style w-full placeholder-white/50"
                  placeholder="email@company.com"
                />
                {errors.email && (
                  <p className="text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-white mb-3 text-start">
                Type of Manufacturing
              </label>
              <div className=" flex flex-wrap justify-between max-w-3xl">
                {["Discrete", "Process", "Batch"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.manufacturingType.includes(type)}
                      onChange={() =>
                        handleCheckboxChange("manufacturingType", type)
                      }
                      className="w-5 h-5 text-primary bg-gray-700 rounded active:bg-primary"
                    />
                    <span className="text-white text-lg">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-start">
              <div>
                <label className="block font-medium text-white mb-2 ">
                  Number of Machines
                </label>
                <input
                  min="0"
                  type="number"
                  value={formData.numberOfMachines}
                  onChange={(e) =>
                    handleInputChange("numberOfMachines", e.target.value)
                  }
                  className="input-style placeholder-white/50 w-full"
                  placeholder="e.g., 15"
                />
              </div>
              <div>
                <label className="block  font-medium text-white mb-2">
                  Number of Shifts
                </label>
                <div className="w-full relative">
                  <select
                    value={formData.numberOfShifts}
                    onChange={(e) =>
                      handleInputChange("numberOfShifts", e.target.value)
                    }
                    className={`input-style w-full appearance-none pr-10 ${
                      formData.numberOfShifts
                        ? "text-white focus:text-black"
                        : "text-white/50 focus:text-black"
                    }`}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="1">1 Shift</option>
                    <option value="2">2 Shifts</option>
                    <option value="3">3 Shifts</option>
                  </select>

                  <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-white mb-2">
                  Approx. Manpower
                </label>
                <input
                  min="0"
                  type="number"
                  value={formData.approxManpower}
                  onChange={(e) =>
                    handleInputChange("approxManpower", e.target.value)
                  }
                  className="input-style placeholder-white/50 w-full"
                  placeholder="e.g., 50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stage 2 */}
        {currentStage === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold font-Bai_Jamjuree text-primary mb-2">
                Stage 2: Current System & Pain Points
              </h2>
              <p className="text-gray-300 mb-4">
                Help us understand your challenges to position our ERP value
              </p>
              <BottomLine className="mx-auto" />
            </div>
            <div>
              <label className="block text-lg md:text-2xl font-medium text-primary mb-3 text-start">
                Currently Using
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["Excel", "Tally", "Any ERP", "Fully Manual"].map((system) => (
                  <label
                    key={system}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.currentSystem.includes(system)}
                      onChange={() =>
                        handleCheckboxChange("currentSystem", system)
                      }
                      className="w-5 h-5 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-white">{system}</span>
                  </label>
                ))}
              </div>
            </div>
            {formData.currentSystem.includes("Any ERP") && (
              <div>
                <label className="block text-start font-medium text-white mb-2">
                  Which ERP?
                </label>
                <input
                  type="text"
                  value={formData.otherERP}
                  onChange={(e) =>
                    handleInputChange("otherERP", e.target.value)
                  }
                  className="input-style w-full placeholder-white/50"
                  placeholder="ERP name"
                />
              </div>
            )}
            <div>
              <label className="block text-lg md:text-2xl font-medium text-primary mb-3 text-start">
                Major Problems Facing
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  "Production planning issues",
                  "Inventory mismatch",
                  "Wastage not tracked",
                  "Delays in reporting",
                  "Dependency on staff",
                  "Quality control issues",
                  "Manual data entry errors",
                ].map((problem) => (
                  <label
                    key={problem}
                    className="flex items-center space-x-3 cursor-pointer "
                  >
                    <input
                      type="checkbox"
                      checked={formData.painPoints.includes(problem)}
                      onChange={() =>
                        handleCheckboxChange("painPoints", problem)
                      }
                      className="w-5 h-5 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-white">{problem}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-lg md:text-2xl font-medium text-primary mb-2 text-start">
                Other Pain Points
              </label>
              <textarea
                value={formData.otherPainPoint}
                onChange={(e) =>
                  handleInputChange("otherPainPoint", e.target.value)
                }
                className="input-style w-full placeholder-white/50"
                rows="4"
                placeholder="Describe any other challenges..."
              />
            </div>
          </div>
        )}

        {/* Stage 3 */}
        {currentStage === 3 && (
          <div className="space-y-8 text-start">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-Bai_Jamjuree text-primary mb-2">
                Stage 3: Module Requirement Mapping
              </h2>
              <p className="text-gray-300 mb-4">
                Identify specific features your business needs
              </p>
              <BottomLine className="mx-auto" />
            </div>
            {/* Production Module */}
            <div className=" space-y-6">
              <h3 className="text-lg md:text-2xl font-bold text-primary font-Bai_Jamjuree">
                Production Module
              </h3>
              <div>
                <label className="block font-medium text-white mb-3">
                  Job Cards Required?
                </label>
                <div className="flex flex-wrap gap-8">
                  {["Yes", "No", "Not Sure"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="jobCards"
                        checked={formData.productionJobCards === option}
                        onChange={() =>
                          handleInputChange("productionJobCards", option)
                        }
                        className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                      />
                      <span className="text-white">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-medium text-white mb-2">
                  Production Type
                </label>
                <div className="w-full relative">
                  <select
                    value={formData.productionType}
                    onChange={(e) =>
                      handleInputChange("productionType", e.target.value)
                    }
                    className={`input-style w-full appearance-none pr-10 ${
                      formData.productionType
                        ? "text-white focus:text-black"
                        : "text-white/50 focus:text-black"
                    }`}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Batch-wise">Batch-wise</option>
                    <option value="Order-wise">Order-wise</option>
                    <option value="Both">Both</option>
                  </select>
                  <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                  
                </div>
              </div>
              <div>
                <label className="block font-medium text-white mb-3">
                  Rejection & Wastage Tracking?
                </label>
                <div className="flex gap-8">
                  {["Yes", "No"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rejection"
                        checked={formData.rejectionTracking === option}
                        onChange={() =>
                          handleInputChange("rejectionTracking", option)
                        }
                        className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                      />
                      <span className="text-white">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Inventory Module */}
              <div className=" space-y-6">
                <h3 className="text-lg md:text-2xl font-bold text-primary font-Bai_Jamjuree">
                  Inventory Module
                </h3>
                <div>
                  <label className="block font-medium text-white mb-3">
                    Raw Material Tracking?
                  </label>
                  <div className="flex gap-8">
                    {["Yes", "No"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rawMaterial"
                          checked={formData.rawMaterialTracking === option}
                          onChange={() =>
                            handleInputChange("rawMaterialTracking", option)
                          }
                          className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-white mb-3">
                    Barcode Required?
                  </label>
                  <div className="flex flex-wrap gap-8">
                    {["Yes", "No", "Maybe Later"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="barcode"
                          checked={formData.barcodeRequired === option}
                          onChange={() =>
                            handleInputChange("barcodeRequired", option)
                          }
                          className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-white mb-3">
                    Lot / Batch Tracking?
                  </label>
                  <div className="flex gap-8">
                    {["Yes", "No"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="lotTracking"
                          checked={formData.lotTracking === option}
                          onChange={() =>
                            handleInputChange("lotTracking", option)
                          }
                          className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {/* Sales & Dispatch */}
              <div className=" space-y-6">
                <h3 className="text-lg md:text-2xl font-bold text-primary font-Bai_Jamjuree">
                  Sales & Dispatch Module
                </h3>
                <div>
                  <label className="block font-medium text-white mb-3">
                    Order Tracking?
                  </label>
                  <div className="flex gap-8">
                    {["Yes", "No"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="orderTracking"
                          checked={formData.orderTracking === option}
                          onChange={() =>
                            handleInputChange("orderTracking", option)
                          }
                          className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-white mb-3">
                    Delivery Schedule?
                  </label>
                  <div className="flex gap-8">
                    {["Yes", "No"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="deliverySchedule"
                          checked={formData.deliverySchedule === option}
                          onChange={() =>
                            handleInputChange("deliverySchedule", option)
                          }
                          className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-white mb-3">
                    Invoice Integration?
                  </label>
                  <div className="flex gap-8">
                    {["Yes", "No"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="invoiceIntegration"
                          checked={formData.invoiceIntegration === option}
                          onChange={() =>
                            handleInputChange("invoiceIntegration", option)
                          }
                          className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Reports */}
            <div className="">
              <h3 className="text-2xl md:text-3xl font-bold text-primary font-Bai_Jamjuree mb-4">
                Reports Required
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "dailyReport", label: "Daily Production Report" },
                  { key: "shiftReport", label: "Shift-wise Report" },
                  {
                    key: "machineEfficiency",
                    label: "Machine-wise Efficiency",
                  },
                  { key: "dashboard", label: "Management Dashboard" },
                ].map((report) => (
                  <label
                    key={report.key}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData[report.key]}
                      onChange={(e) =>
                        handleInputChange(report.key, e.target.checked)
                      }
                      className="w-5 h-5 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-white">{report.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stage 4 */}
        {currentStage === 4 && (
          <div className="space-y-8 text-start">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-Bai_Jamjuree text-primary mb-2">
                Stage 4: Commercial & Customization
              </h2>
              <p className="text-gray-300 mb-4">
                Final details for accurate proposal and pricing
              </p>
              <BottomLine className="mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-white/90 mb-2">
                  Number of Users
                </label>
                <input
                  min="0"
                  type="number"
                  value={formData.numberOfUsers}
                  onChange={(e) =>
                    handleInputChange("numberOfUsers", e.target.value)
                  }
                  className="input-style w-full placeholder-white/50"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block font-medium text-white/90 mb-2">
                  Number of Plants
                </label>
                <input
                  min="0"
                  type="number"
                  value={formData.numberOfPlants}
                  onChange={(e) =>
                    handleInputChange("numberOfPlants", e.target.value)
                  }
                  className="input-style w-full placeholder-white/50"
                  placeholder="e.g., 2"
                />
              </div>
            </div>
            <div>
              <label className="block text-xl md:text-3xl font-medium text-white mb-5">
                Deployment Preference
              </label>
              <div className="space-y-2">
                {["Cloud-based", "On-premise", "Hybrid", "Not Sure"].map(
                  (option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="deployment"
                        checked={formData.deployment === option}
                        onChange={() => handleInputChange("deployment", option)}
                        className="w-5 h-5 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                      />
                      <span className="text-white">{option}</span>
                    </label>
                  )
                )}
              </div>
            </div>
            <div>
              <label className="block text-xl md:text-3xl font-medium text-white mb-3">
                Custom Features Required
              </label>
              <textarea
                value={formData.customFeatures}
                onChange={(e) =>
                  handleInputChange("customFeatures", e.target.value)
                }
                className="input-style w-full placeholder-white/50"
                rows="4"
                placeholder="Describe any specific customizations or special requirements..."
              />
            </div>
            <div>
              <label className="block textlg: md:text-2xl font-medium text-white/90 mb-2">
                Expected Go-Live Timeline
              </label>
              <div className="w-full relative">
                
              <select
                value={formData.goLiveTimeline}
                onChange={(e) =>
                  handleInputChange("goLiveTimeline", e.target.value)
                }
                className={`input-style w-full appearance-none pr-10 ${
                      formData.goLiveTimeline
                        ? "text-white focus:text-black"
                        : "text-white/50 focus:text-black"
                    }`}
                >
                <option value="" disabled>Select timeline</option>
                <option value="Immediate (Within 1 month)">
                  Immediate (Within 1 month)
                </option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6+ months">6+ months</option>
                <option value="Just exploring">Just exploring</option>
              </select>
                  <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />

                </div>
            </div>
            <div className="border-t border-primary/30 pt-6">
              <h3 className="text-xl md:text-3xl font-bold text-primary font-Bai_Jamjuree mb-4">
                Lead Management
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-white mb-2">
                    Lead Status
                  </label>
                  <div className="w-full relative">

                  <select
                    value={formData.leadStatus}
                    onChange={(e) =>
                      handleInputChange("leadStatus", e.target.value)
                    }
                    className={`input-style w-full appearance-none pr-10 ${
                      formData.leadStatus
                        ? "text-white focus:text-black"
                        : "text-white/50 focus:text-black"
                    }`}
                    >
                    <option value="New">New</option>
                    <option value="Demo Done">Demo Done</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                  <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />

                    </div>
                </div>
                <div>
                  <label className="block font-medium text-white mb-2">
                    Priority
                  </label>
                  <div className="w-full relative">

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className={`input-style w-full appearance-none pr-10 ${
                      formData.priority
                        ? "text-white focus:text-black"
                        : "text-white/50 focus:text-black"
                    }`}
                    >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />

                    </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/20 border border-primary rounded-lg p-4 mb-6">
              <p className="text-primary text-sm text-start">
                ✅ <strong>All stages completed!</strong> Click "Submit to Get
                Started" to send us your requirements.
              </p>
            </div>
            {submitStatus && (
              <div
                className={`border rounded-lg p-4 mb-6 ${
                  submitStatus.type === "success"
                    ? "bg-primary/20 border-primary"
                    : "bg-red-500/20 border-red-500"
                }`}
              >
                <p
                  className={`${
                    submitStatus.type === "success"
                      ? "text-primary"
                      : "text-red-400"
                  }`}
                >
                  {submitStatus.message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="bg-[#464646]/50 backdrop-blur-md rounded-lg p-6 flex  justify-between items-center border border-primary/20">
        <button
          onClick={prevStage}
          disabled={currentStage === 1}
          className={`flex items-center space-x-2 px-4 md:px-6 py-3 rounded-lg font-bold font-Bai_Jamjuree transition-all duration-300 ${
            currentStage === 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed hidden"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-3">
          {currentStage === 4 && (
            <>
              <button
                onClick={submitAndEmail}
                disabled={isSubmitting || submitStatus?.type === "success"}
                className={`flex items-center gap-2 md:space-x-2 px-2 md:px-8 py-3 rounded-lg font-bold font-Bai_Jamjuree transition-all duration-300 ${
                  isSubmitting || submitStatus?.type === "success"
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-white text-secondary shadow-lg transition-all duration-1000 hover:bg-gradient-to-r hover:from-primary hover:to-primary"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : submitStatus?.type === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submitted!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="hidden md:block">Submit to Get Started</span>
                    <span className="md:hidden">Get Started </span>
                  </>
                )}
              </button>
              {/* <button
                onClick={downloadPDF}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-black rounded-lg font-bold font-Bai_Jamjuree hover:bg-primary/80 transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                <span>Download Copy</span>
              </button> */}
            </>
          )}
        </div>

        <button
          onClick={nextStage}
          disabled={currentStage === 4}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold font-Bai_Jamjuree transition-all duration-300 ${
            currentStage === 4
              ? "bg-gray-700 text-gray-500 cursor-not-allowed hidden"
              : "bg-gradient-to-r from-primary to-white text-secondary hover:bg-primary/80"
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mt-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-primary mb-2 font-Bai_Jamjuree">
          💡 Pro Tip
        </h3>
        <p className="text-gray-300 text-sm max-w-2xl mx-auto">
          Send this to your prospects: "To understand your manufacturing process
          properly and suggest the right ERP configuration, we request you to
          share some basic details. This helps us avoid unnecessary features and
          give you an accurate solution and pricing."
        </p>
      </div>
    </section>
  );
}
