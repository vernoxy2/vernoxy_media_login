import { useEffect, useCallback, useRef } from "react";
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
import {
  COUNTRY_NAMES,
  SERVICE_NAMES,
  MONTHS,
  YEARS,
  CURRENT_MONTH,
} from "../../../types/project";
import { useProjects } from "../../../context/ProjectContext";

export function BaseProjectForm({
  form,
  projectId,
  isEditMode = false,
  isContentWriter = false,
  currentUser = null,
  onTimerStart = null,
  showServiceForm = false,
  hideAdminFromDropdown = false,
  countdownTimerComponent = null,
}) {
  const { teamMembers } = useProjects();
  const saveTimeoutRef = useRef(null);
  
  const statuses = [
    "Draft",
    "Accepted",
    "In Progress",
    "Review",
    "Approved",
    "Delivered",
  ];
  const getAvailableMonths = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    return MONTHS.slice(currentMonth);
  };
  const availableMonths = getAvailableMonths();
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);
  const filteredTeamMembers = (teamMembers || []).filter((member) => {
    if (isEditMode) {
      return true;
    }
    if (hideAdminFromDropdown && member.role === "admin") {
      return false;
    }
    if (currentUser?.role === "admin") {
      return member.role !== "admin";
    }
    const matchByName = currentUser?.name && member.name === currentUser.name;
    const matchByEmail =
      currentUser?.email && member.email === currentUser.email;
    return !matchByName && !matchByEmail;
  });

  // ✅ FIX: Memoize localStorage key function
  const getLocalStorageKey = useCallback(() => {
    return `baseProject_autosave_${projectId || 'new'}`;
  }, [projectId]);

  // ✅ FIX: Debounced save function
  const saveToLocalStorage = useCallback((value) => {
    if (isEditMode || !projectId) return;
    
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save by 300ms
    saveTimeoutRef.current = setTimeout(() => {
      const key = getLocalStorageKey();
      const dataToSave = {
        internalNotes: value || '',
        timestamp: new Date().toISOString()
      };
      
      try {
        localStorage.setItem(key, JSON.stringify(dataToSave));
        console.log('💾 BaseProject - Saved to localStorage:', key, dataToSave);
      } catch (error) {
        console.error('❌ BaseProject - Error saving:', error);
      }
    }, 300);
  }, [isEditMode, projectId, getLocalStorageKey]);

  // ✅ FIX: Load internalNotes from localStorage on mount
  useEffect(() => {
    if (isEditMode || !projectId) return;

    const key = getLocalStorageKey();
    const savedData = localStorage.getItem(key);
    
    console.log('🔍 BaseProject - Checking localStorage:', key, savedData);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.internalNotes) {
          setTimeout(() => {
            form.setValue('internalNotes', parsed.internalNotes, { 
              shouldValidate: false,
              shouldDirty: false 
            });
            console.log('✅ BaseProject - Restored internalNotes:', parsed.internalNotes);
          }, 100);
        }
      } catch (error) {
        console.error('❌ BaseProject - Error loading autosave:', error);
      }
    } else {
      console.log('ℹ️ BaseProject - No saved data found');
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isEditMode, projectId, form, getLocalStorageKey]);

  return (
    <div className="space-y-6">
      {/* Project ID Display with Timer/User Info */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Project ID
          </label>
          <p className="font-mono text-lg font-semibold text-foreground mt-1">
            {projectId || "Will be generated..."}
          </p>
        </div>

        <div>
          {showServiceForm &&
            countdownTimerComponent &&
            countdownTimerComponent}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Client Name{" "}
                {!isEditMode && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter client name"
                  {...field}
                  disabled={isEditMode}
                  className={
                    isEditMode
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country Field */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Country{" "}
                {!isEditMode && <span className="text-destructive">*</span>}
              </FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {COUNTRY_NAMES[field.value] || field.value}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(COUNTRY_NAMES).map((code) => (
                      <SelectItem key={code} value={code}>
                        {COUNTRY_NAMES[code]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Type Field */}
        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Service Type{" "}
                {!isEditMode && <span className="text-destructive">*</span>}
              </FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {SERVICE_NAMES[field.value] || field.value}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(SERVICE_NAMES).map((code) => (
                      <SelectItem key={code} value={code}>
                        {SERVICE_NAMES[code]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Status <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className={
                      isContentWriter
                        ? "bg-gray-100 dark:bg-gray-300 text-gray-800 dark:text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isContentWriter ? (
                    <SelectItem value="Draft">Draft</SelectItem>
                  ) : (
                    statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {isContentWriter && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1"></p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Month Field */}
        <FormField
          control={form.control}
          name="month"
          defaultValue={CURRENT_MONTH}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Month{" "}
                {!isEditMode && <span className="text-destructive">*</span>}
              </FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {field.value}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Year Field */}
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Year{" "}
                {!isEditMode && <span className="text-destructive">*</span>}
              </FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {field.value}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Estimated Time - Hours and Minutes with Start Button */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Assigned To Field */}
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Assigned To{" "}
                {!isEditMode && <span className="text-destructive">*</span>}
              </FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {(() => {
                    const member = (teamMembers || []).find(
                      (m) => m.id === field.value,
                    );
                    return member?.name || field.value || "Not Assigned";
                  })()}
                </div>
              ) : (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredTeamMembers.length > 0 ? (
                      filteredTeamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No team members available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estimated Time Field */}
        <div>
          <FormLabel>Estimated Time</FormLabel>
          {isEditMode ? (
            <div className="flex gap-3 mt-2">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <div className="flex-1 px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {String(field.value || 0).padStart(2, "0")} {field.value == "1" ? "hour" : "hours"}
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedMinutes"
                render={({ field }) => (
                  <div className="flex-1 px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {String(field.value || 0).padStart(2, "0")} {field.value == "1" ? "min" : "mins"}
                  </div>
                )}
              />
            </div>
          ) : (
            <div className="flex gap-3 mt-2">
              {/* Hours Dropdown */}
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Hours" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hoursOptions.map((hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {String(hour).padStart(2, "0")}{" "}
                            {hour === 1 ? "hour" : "hours"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Minutes Dropdown */}
              <FormField
                control={form.control}
                name="estimatedMinutes"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Minutes" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {minutesOptions.map((minute) => (
                          <SelectItem key={minute} value={minute.toString()}>
                            {String(minute).padStart(2, "0")}{" "}
                            {minute === 1 ? "min" : "mins"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Button */}
              {!isEditMode && onTimerStart && (
                <button
                  type="button"
                  onClick={onTimerStart}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Start
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ FIX: Internal Notes with direct onChange handler */}
      <FormField
        control={form.control}
        name="internalNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any internal notes or comments..."
                className="min-h-[100px]"
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  // Call the form's onChange first
                  field.onChange(e);
                  // Then save to localStorage
                  saveToLocalStorage(e.target.value);
                }}
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
export const clearBaseProjectAutosave = (projectId) => {
  const key = `baseProject_autosave_${projectId || 'new'}`;
  localStorage.removeItem(key);
};