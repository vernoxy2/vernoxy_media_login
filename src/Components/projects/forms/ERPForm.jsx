import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../Components/ui/form';
import { Input } from '../../../Components/ui/input';
import { Textarea } from '../../../Components/ui/textarea';
import { Checkbox } from '../../../Components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../Components/ui/select';

const erpTypes = ['Manufacturing', 'CRM', 'Inventory', 'HRMS'];
const availableModules = [
  'Inventory Management',
  'Production Planning',
  'Quality Control',
  'Procurement',
  'Sales & Orders',
  'Finance & Accounting',
  'Human Resources',
  'Payroll',
  'Reporting & Analytics',
  'Customer Portal',
  'Vendor Portal',
  'Warehouse Management',
];

export function ERPForm({ form }) {
  const selectedModules = form.watch('erp.modulesRequired') || [];

  const toggleModule = (module) => {
    const current = form.getValues('erp.modulesRequired') || [];
    if (current.includes(module)) {
      form.setValue('erp.modulesRequired', current.filter((m) => m !== module));
    } else {
      form.setValue('erp.modulesRequired', [...current, module]);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-service-erp/20 bg-service-erp/5 p-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-service-erp" />
        <h3 className="text-lg font-semibold text-foreground">ERP Development Details</h3>
      </div>

      <FormField
        control={form.control}
        name="erp.erpType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ERP Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

      {/* Modules Selection */}
      <FormItem>
        <FormLabel>Modules Required</FormLabel>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {availableModules.map((module) => (
            <label
              key={module}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={selectedModules.includes(module)}
                onCheckedChange={() => toggleModule(module)}
              />
              <span className="text-sm text-foreground">{module}</span>
            </label>
          ))}
        </div>
      </FormItem>

      <FormField
        control={form.control}
        name="erp.workflowDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Workflow Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the main workflows and processes..."
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="erp.userRoles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Roles</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Admin, Manager, Operator" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="erp.integrationsRequired"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Integrations Required</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SAP, Salesforce, Quickbooks" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="erp.technicalNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Technical Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add technical requirements and specifications..."
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
