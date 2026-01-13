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
} from "../../../types/project";
import { useProjects } from "../../../context/ProjectContext";

const statuses = ["Draft", "In Progress", "Review", "Approved", "Delivered"];

export function BaseProjectForm({ form, projectId, isEditMode = false, isContentWriter = false, currentUser = null }) {
  const { teamMembers, availableTeamMembers } = useProjects();

  // 🎯 Filter months to show only current month + future months
  const getAvailableMonths = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (0 = January, 11 = December)
    
    // Return months from current month onwards
    return MONTHS.slice(currentMonth);
  };

  const availableMonths = getAvailableMonths();

  return (
    <div className="space-y-6">
      {/* Project ID Display - Always visible in both modes */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Project ID
        </label>
        <p className="font-mono text-lg font-semibold text-foreground mt-1">
          {projectId || "Will be generated..."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Name Field */}
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

        {/* 🎯 Status Field - Content Writers see only "Draft", others see all */}
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
                disabled={isContentWriter}
              >
                <FormControl>
                  <SelectTrigger className={isContentWriter ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isContentWriter ? (
                    // Content Writer માટે માત્ર Draft
                    <SelectItem value="Draft">Draft</SelectItem>
                  ) : (
                    // બીજા બધા માટે બધા status
                    statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {isContentWriter && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 🎯 Month Field - Shows only current + future months */}
        <FormField
          control={form.control}
          name="month"
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
                      <SelectValue placeholder="Select month" />
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
      <div className="grid gap-6 md:grid-cols-12">
        {/* Assigned To Field - 6 columns */}
        <div className="md:col-span-6">
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                {isEditMode ? (
                  <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {(teamMembers || []).find((m) => m.id === field.value)
                      ?.name ||
                      field.value ||
                      "Not Assigned"}
                  </div>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(teamMembers || []).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.role})
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

        <div className="md:col-span-3">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="--:-- --"
                    readOnly
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-3">
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="--:-- --"
                    readOnly
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}