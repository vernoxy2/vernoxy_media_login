import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../Components/ui/form';
import { Input } from '../../../Components/ui/input';
import { Textarea } from '../../../Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../Components/ui/select';
import {
  COUNTRY_NAMES,
  SERVICE_NAMES,
  MONTHS,
  YEARS,
} from '../../../types/project';
import { useProjects } from '../../../context/ProjectContext';

const statuses = ['Draft', 'In Progress', 'Review', 'Approved', 'Delivered'];

export function BaseProjectForm({ form, projectId, isEditMode = false }) {
  const { teamMembers } = useProjects();

  return (
    <div className="space-y-6">
      {/* Project ID Display - Always visible in both modes */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Project ID
        </label>
        <p className="font-mono text-lg font-semibold text-foreground mt-1">
          {projectId || 'Will be generated...'}
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
                Client Name {!isEditMode && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter client name" 
                  {...field}
                  disabled={isEditMode}
                  className={isEditMode ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : ""}
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
                Country {!isEditMode && <span className="text-destructive">*</span>}
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
                Service Type {!isEditMode && <span className="text-destructive">*</span>}
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

        {/* Status Field - ALWAYS EDITABLE */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Status <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Month {!isEditMode && <span className="text-destructive">*</span>}
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
                    {MONTHS.map((month) => (
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
                Year {!isEditMode && <span className="text-destructive">*</span>}
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

        {/* Assigned To Field */}
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Assigned To
              </FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {teamMembers.find(m => m.id === field.value)?.name || field.value || 'Not Assigned'}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teamMembers.map((member) => (
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

      {/* Internal Notes Field - ALWAYS EDITABLE */}
      <FormField
        control={form.control}
        name="internalNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Internal Notes
            </FormLabel>
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