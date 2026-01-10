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
import { Checkbox } from '../../../Components/ui/checkbox';

const erpTypes = ['Custom ERP', 'CRM', 'Inventory Management', 'HR Management', 'Accounting Software'];

const erpModules = [
  'Sales Management',
  'Purchase Management',
  'Inventory Control',
  'HR & Payroll',
  'Accounting & Finance',
  'Customer Relationship Management',
  'Reporting & Analytics',
  'User Management',
];

export function ERPForm({ form }) {
  return (
    <div className="space-y-6 rounded-xl border border-service-erp/20 bg-service-erp/5 p-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-service-erp" />
        <h3 className="text-lg font-semibold text-foreground">ERP Details</h3>
      </div>

      {/* ERP Type */}
      <FormField
        control={form.control}
        name="erp.erpType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ERP Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
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
                                    currentValue.filter((value) => value !== module)
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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}