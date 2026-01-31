// import { useState, useEffect } from "react";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "../../../Components/ui/form";
// import { Input } from "../../../Components/ui/input";
// import { Textarea } from "../../../Components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../../Components/ui/select";
// import { Checkbox } from "../../../Components/ui/checkbox";
// import { X } from "lucide-react";
// import { CiCirclePlus } from "react-icons/ci";

// export function ERPForm({ form, isEditMode = false, existingData = null }) {
//   const [links, setLinks] = useState([""]);
//   const erpTypes = [
//     "Custom ERP",
//     "CRM",
//     "Inventory Management",
//     "HR Management",
//     "Accounting Software",
//   ];

//   const erpModules = [
//     "Sales Management",
//     "Purchase Management",
//     "Inventory Control",
//     "HR & Payroll",
//     "Accounting & Finance",
//     "Customer Relationship Management",
//     "Reporting & Analytics",
//     "User Management",
//   ];

//   // FIXED: Filter empty links before saving to form
//   useEffect(() => {
//     // Filter out empty strings and only save non-empty links
//     const nonEmptyLinks = links.filter((link) => link && link.trim() !== "");
//     form.setValue("erp.link", nonEmptyLinks.length > 0 ? nonEmptyLinks : []);
//   }, [links, form]);

//   const addLink = () => {
//     setLinks([...links, ""]);
//   };

//   const updateLink = (index, value) => {
//     const updated = [...links];
//     updated[index] = value;
//     setLinks(updated);
//   };

//   const removeLink = (index) => {
//     setLinks(links.filter((_, i) => i !== index));
//   };

//   useEffect(() => {
//     if (isEditMode && existingData?.link?.length) {
//       setLinks(existingData.link);
//     }
//   }, [isEditMode, existingData]);

//   return (
//     <div className="space-y-6 rounded-xl border border-service-erp/20 bg-service-erp/5 p-6">
//       <div className="flex items-center gap-2">
//         <div className="h-2 w-2 rounded-full bg-service-erp" />
//         <h3 className="text-lg font-semibold text-foreground">ERP Details</h3>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 space-y-2 space-x-5">
//         <FormField
//           control={form.control}
//           name="erp.erpType"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>ERP Type</FormLabel>
//               <Select onValueChange={field.onChange} value={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select ERP type" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {erpTypes.map((type) => (
//                     <SelectItem key={type} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <div className="">
//           <FormLabel>Reference Links (Optional)</FormLabel>
//           {links.map((link, index) => (
//             <div
//               key={index}
//               className="flex items-center gap-2"
//             >
//               <Input
//                 placeholder={`Reference Link ${index + 1}`}
//                 value={link}
//                 onChange={(e) => updateLink(index, e.target.value)}
//               />

//               {index === links.length - 1 && (
//                 <CiCirclePlus
//                   size={28}
//                   className="cursor-pointer text-gray-600 hover:text-black"
//                   onClick={addLink}
//                 />
//               )}

//               {links.length > 1 && (
//                 <X
//                   size={20}
//                   className="cursor-pointer text-red-500 hover:text-red-700"
//                   onClick={() => removeLink(index)}
//                 />
//               )}
//             </div>
//           ))}
//           <FormMessage>{form.formState.errors?.erp?.link?.message}</FormMessage>
//         </div>
//       </div>

//       {/* Modules Required */}
//       <FormField
//         control={form.control}
//         name="erp.modulesRequired"
//         render={() => (
//           <FormItem>
//             <div className="mb-4">
//               <FormLabel>Modules Required</FormLabel>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               {erpModules.map((module) => (
//                 <FormField
//                   key={module}
//                   control={form.control}
//                   name="erp.modulesRequired"
//                   render={({ field }) => {
//                     return (
//                       <FormItem
//                         key={module}
//                         className="flex flex-row items-start space-x-3 space-y-0"
//                       >
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value?.includes(module)}
//                             onCheckedChange={(checked) => {
//                               const currentValue = field.value || [];
//                               return checked
//                                 ? field.onChange([...currentValue, module])
//                                 : field.onChange(
//                                     currentValue.filter(
//                                       (value) => value !== module,
//                                     ),
//                                   );
//                             }}
//                           />
//                         </FormControl>
//                         <FormLabel className="font-normal text-sm">
//                           {module}
//                         </FormLabel>
//                       </FormItem>
//                     );
//                   }}
//                 />
//               ))}
//             </div>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       {/* Workflow Description */}
//       <FormField
//         control={form.control}
//         name="erp.workflowDescription"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Workflow Description</FormLabel>
//             <FormControl>
//               <Textarea
//                 placeholder="Describe the complete workflow and business processes..."
//                 className="min-h-[150px]"
//                 {...field}
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       {/* User Roles */}
//       <FormField
//         control={form.control}
//         name="erp.userRoles"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>User Roles</FormLabel>
//             <FormControl>
//               <Input
//                 placeholder="e.g., Admin, Manager, Employee, Accountant"
//                 {...field}
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       {/* Integrations Required */}
//       <FormField
//         control={form.control}
//         name="erp.integrationsRequired"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Integrations Required</FormLabel>
//             <FormControl>
//               <Textarea
//                 placeholder="e.g., Payment Gateway, Email Service, SMS Gateway, Third-party APIs"
//                 className="min-h-[100px]"
//                 {...field}
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       {/* Technical Notes */}
//       <FormField
//         control={form.control}
//         name="erp.technicalNotes"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Technical Notes & Requirements</FormLabel>
//             <FormControl>
//               <Textarea
//                 placeholder="Add technical specifications, database requirements, hosting details, etc."
//                 className="min-h-[120px]"
//                 {...field}
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </div>
//   );
// }

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../Components/ui/form";
import { Input } from "../../../Components/ui/input";
import { Textarea } from "../../../Components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { Checkbox } from "../../../Components/ui/checkbox";
import { X } from "lucide-react";
import { CiCirclePlus } from "react-icons/ci";

export function ERPForm({ form, isEditMode = false, existingData = null, projectId }) {
  const [links, setLinks] = useState([""]);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  const erpTypes = [
    "Custom ERP",
    "CRM",
    "Inventory Management",
    "HR Management",
    "Accounting Software",
  ];

  const erpModules = [
    "Sales Management",
    "Purchase Management",
    "Inventory Control",
    "HR & Payroll",
    "Accounting & Finance",
    "Customer Relationship Management",
    "Reporting & Analytics",
    "User Management",
  ];

  // ✅ Memoize localStorage key
  const getLocalStorageKey = useCallback(() => {
    return `erp_autosave_${projectId || 'new'}`;
  }, [projectId]);

  // ✅ Filter empty links before saving to form
  useEffect(() => {
    const nonEmptyLinks = links.filter((link) => link && link.trim() !== "");
    form.setValue("erp.link", nonEmptyLinks.length > 0 ? nonEmptyLinks : []);
  }, [links, form]);

  useEffect(() => {
    if (isEditMode && existingData?.link?.length) {
      setLinks(existingData.link);
    }
  }, [isEditMode, existingData]);

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index, value) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // ✅ Memoized save function
  const saveToLocalStorage = useCallback((watchedValues) => {
    if (!isInitialized) return;
    
    const erpData = watchedValues?.erp || {};
    
    const formData = {
      erpType: erpData.erpType || '',
      modulesRequired: erpData.modulesRequired || [],
      workflowDescription: erpData.workflowDescription || '',
      userRoles: erpData.userRoles || '',
      integrationsRequired: erpData.integrationsRequired || '',
      technicalNotes: erpData.technicalNotes || '',
      link: (erpData.link || []).filter(l => l && l.trim() !== ''),
    };

    const dataToSave = {
      formData,
      timestamp: new Date().toISOString()
    };

    const key = getLocalStorageKey();
    localStorage.setItem(key, JSON.stringify(dataToSave));
    console.log('✅ ERP saved to localStorage:', key, dataToSave);
  }, [getLocalStorageKey, isInitialized]);

  // ✅ Load data from localStorage
  useEffect(() => {
    if (hasLoadedFromStorage.current || !projectId) return;
    
    const key = getLocalStorageKey();
    const savedData = localStorage.getItem(key);
    
    console.log('🔍 Checking ERP localStorage:', key, savedData);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        if (!isEditMode || !existingData) {
          console.log('📥 Restoring ERP from localStorage:', parsed);
          
          setTimeout(() => {
            if (parsed.formData) {
              Object.keys(parsed.formData).forEach((key) => {
                const value = parsed.formData[key];
                if (value !== '' && value !== null && value !== undefined) {
                  form.setValue(`erp.${key}`, value, {
                    shouldValidate: false,
                    shouldDirty: false
                  });
                  console.log(`✅ Restored erp.${key}:`, value);
                }
              });

              // Restore links
              if (parsed.formData.link && parsed.formData.link.length > 0) {
                setLinks(parsed.formData.link);
              }
            }
            
            hasLoadedFromStorage.current = true;
            setIsInitialized(true);
          }, 100);
        } else {
          hasLoadedFromStorage.current = true;
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('❌ Error loading ERP autosaved data:', error);
        hasLoadedFromStorage.current = true;
        setIsInitialized(true);
      }
    } else {
      console.log('ℹ️ No ERP saved data found');
      hasLoadedFromStorage.current = true;
      setIsInitialized(true);
    }
  }, [projectId, isEditMode, existingData, form, getLocalStorageKey]);

  // ✅ Watch form changes and auto-save
  useEffect(() => {
    if (!isInitialized) return;
    
    const subscription = form.watch((value) => {
      saveToLocalStorage(value);
    });
    
    return () => subscription.unsubscribe();
  }, [form, saveToLocalStorage, isInitialized]);

  return (
    <div className="space-y-6 rounded-xl border border-service-erp/20 bg-service-erp/5 p-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-service-erp" />
        <h3 className="text-lg font-semibold text-foreground">ERP Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="erp.erpType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ERP Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ERP type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {erpTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Reference Links (Optional)</FormLabel>
          {links.map((link, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              <Input
                placeholder={`Reference Link ${index + 1}`}
                value={link}
                onChange={(e) => updateLink(index, e.target.value)}
              />

              {index === links.length - 1 && (
                <CiCirclePlus
                  size={28}
                  className="cursor-pointer text-gray-600 hover:text-black"
                  onClick={addLink}
                />
              )}

              {links.length > 1 && (
                <X
                  size={20}
                  className="cursor-pointer text-gray-600 hover:text-black"
                  onClick={() => removeLink(index)}
                />
              )}
            </div>
          ))}
          <FormMessage>{form.formState.errors?.erp?.link?.message}</FormMessage>
        </div>
      </div>

      {/* Modules Required */}
      <FormField
        control={form.control}
        name="erp.modulesRequired"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Modules Required</FormLabel>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {erpModules.map((module) => (
                <FormField
                  key={module}
                  control={form.control}
                  name="erp.modulesRequired"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={module}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(module)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, module])
                                : field.onChange(
                                    currentValue.filter(
                                      (value) => value !== module,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">
                          {module}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Workflow Description */}
      <FormField
        control={form.control}
        name="erp.workflowDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Workflow Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the complete workflow and business processes..."
                className="min-h-[150px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* User Roles */}
      <FormField
        control={form.control}
        name="erp.userRoles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User Roles</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Admin, Manager, Employee, Accountant"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Integrations Required */}
      <FormField
        control={form.control}
        name="erp.integrationsRequired"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Integrations Required</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., Payment Gateway, Email Service, SMS Gateway, Third-party APIs"
                className="min-h-[100px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Technical Notes */}
      <FormField
        control={form.control}
        name="erp.technicalNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Technical Notes & Requirements</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add technical specifications, database requirements, hosting details, etc."
                className="min-h-[120px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// Export function to clear localStorage
export const clearERPAutosave = (projectId) => {
  const key = `erp_autosave_${projectId || 'new'}`;
  localStorage.removeItem(key);
};