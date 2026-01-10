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

const contentTypes = ['Caption', 'Blog', 'Website Content', 'Ad Copy'];
const tones = ['Professional', 'Friendly', 'Sales', 'Informative'];

export function ContentWritingForm({ form }) {
  return (
    <div className="space-y-6 rounded-xl border border-service-content/20 bg-service-content/5 p-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-service-content" />
        <h3 className="text-lg font-semibold text-foreground">Content Writing Details</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <FormField
          control={form.control}
          name="contentWriting.contentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contentTypes.map((type) => (
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

        <FormField
          control={form.control}
          name="contentWriting.wordCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Word Count</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contentWriting.tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="contentWriting.mainContent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Main Content</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter the main content here..."
                className="min-h-[200px]"
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
          name="contentWriting.cta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Call to Action</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Subscribe now, Learn more" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contentWriting.seoKeywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Keywords</FormLabel>
              <FormControl>
                <Input placeholder="Comma-separated keywords" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="contentWriting.reviewNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Review Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add notes for the review team..."
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