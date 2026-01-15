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

export function BaseProjectForm({
  form,
  projectId,
  isEditMode = false,
  isContentWriter = false,
  currentUser = null,
  onTimerStart = null,
  showServiceForm = false,
  countdownTimerComponent = null,
}) {
  const { teamMembers } = useProjects();

  // Filter months to show only current month + future months
  const getAvailableMonths = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    return MONTHS.slice(currentMonth);
  };

  const availableMonths = getAvailableMonths();

  // Generate hours options (0-23)
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);

  // Generate minutes options (0-59)
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);

  // Filter team members - Remove logged-in user from dropdown
  const filteredTeamMembers = isEditMode
    ? teamMembers || []
    : (teamMembers || []).filter((member) => member.name !== currentUser?.name);

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
        
        {/* Countdown Timer Display */}
        <div>
          {showServiceForm && countdownTimerComponent && countdownTimerComponent}
        </div>
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
                disabled={isContentWriter}
              >
                <FormControl>
                  <SelectTrigger
                    className={
                      isContentWriter
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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

      {/* Estimated Time - Hours and Minutes with Start Button */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Assigned To Field */}
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

        <div>
          <FormLabel>Estimated Time</FormLabel>
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
                    disabled={isEditMode}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={
                          isEditMode
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Hours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hoursOptions.map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour} {hour === 1 ? "hour" : "hours"}
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
                    disabled={isEditMode}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={
                          isEditMode
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Minutes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {minutesOptions.map((minute) => (
                        <SelectItem key={minute} value={minute.toString()}>
                          {minute} {minute === 1 ? "min" : "mins"}
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