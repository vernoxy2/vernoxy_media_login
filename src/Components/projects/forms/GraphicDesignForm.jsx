import { useState, useEffect } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../Components/ui/form';
import { Input } from '../../../Components/ui/input';
import { Textarea } from '../../../Components/ui/textarea';
import { Button } from '../../../Components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../Components/ui/select';
import { Plus, X } from 'lucide-react';

const postTypes = ['Social Post', 'Banner', 'Ad', 'Poster', 'Thumbnail'];
const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'Website'];
const sizes = ['Square', 'Portrait', 'Landscape'];

export function GraphicDesignForm({ form, isEditMode = false, existingData = null }) {
  // State for managing main text updates
  const [mainTextUpdates, setMainTextUpdates] = useState([]);
  const [subTextUpdates, setSubTextUpdates] = useState([]);

  // Load existing updates when in edit mode
  useEffect(() => {
    if (isEditMode && existingData) {
      // Load existing main text updates
      const existingMainUpdates = [];
      let index = 1;
      while (existingData[`mainText${index}`]) {
        existingMainUpdates.push({
          index: index,
          value: existingData[`mainText${index}`],
          isExisting: true // Mark as existing/old record
        });
        // Set form value for existing updates
        form.setValue(`graphicDesign.mainText${index}`, existingData[`mainText${index}`]);
        index++;
      }
      setMainTextUpdates(existingMainUpdates);

      // Load existing sub text updates
      const existingSubUpdates = [];
      index = 1;
      while (existingData[`subText${index}`]) {
        existingSubUpdates.push({
          index: index,
          value: existingData[`subText${index}`],
          isExisting: true // Mark as existing/old record
        });
        // Set form value for existing updates
        form.setValue(`graphicDesign.subText${index}`, existingData[`subText${index}`]);
        index++;
      }
      setSubTextUpdates(existingSubUpdates);
    }
  }, [isEditMode, existingData, form]);

  // Add new main text update field
  const addMainTextUpdate = () => {
    // Find next available index
    let newIndex = 1;
    const usedIndices = mainTextUpdates.map(item => item.index);
    while (usedIndices.includes(newIndex)) {
      newIndex++;
    }
    setMainTextUpdates([...mainTextUpdates, { index: newIndex, value: '', isExisting: false }]);
  };

  // Add new sub text update field
  const addSubTextUpdate = () => {
    // Find next available index
    let newIndex = 1;
    const usedIndices = subTextUpdates.map(item => item.index);
    while (usedIndices.includes(newIndex)) {
      newIndex++;
    }
    setSubTextUpdates([...subTextUpdates, { index: newIndex, value: '', isExisting: false }]);
  };

  // Remove main text update (only for new, non-existing updates)
  const removeMainTextUpdate = (index) => {
    setMainTextUpdates(mainTextUpdates.filter(item => item.index !== index));
    // Remove from form as well
    form.setValue(`graphicDesign.mainText${index}`, undefined);
  };

  // Remove sub text update (only for new, non-existing updates)
  const removeSubTextUpdate = (index) => {
    setSubTextUpdates(subTextUpdates.filter(item => item.index !== index));
    // Remove from form as well
    form.setValue(`graphicDesign.subText${index}`, undefined);
  };

  // Update main text value (only for new updates)
  const updateMainTextValue = (index, value) => {
    setMainTextUpdates(mainTextUpdates.map(item => 
      item.index === index ? { ...item, value } : item
    ));
    // Update form value with correct field name
    form.setValue(`graphicDesign.mainText${index}`, value);
  };

  // Update sub text value (only for new updates)
  const updateSubTextValue = (index, value) => {
    setSubTextUpdates(subTextUpdates.map(item => 
      item.index === index ? { ...item, value } : item
    ));
    // Update form value with correct field name
    form.setValue(`graphicDesign.subText${index}`, value);
  };

  return (
    <div className="space-y-6 rounded-xl border border-service-graphic/20 bg-service-graphic/5 p-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-service-graphic" />
        <h3 className="text-lg font-semibold text-foreground">Graphic Design Details</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Post Type Field */}
        <FormField
          control={form.control}
          name="graphicDesign.postType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Type</FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {field.value || 'Not specified'}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {postTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Platform Field */}
        <FormField
          control={form.control}
          name="graphicDesign.platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {field.value || 'Not specified'}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Size Field */}
        <FormField
          control={form.control}
          name="graphicDesign.size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              {isEditMode ? (
                <div className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {field.value || 'Not specified'}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
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

      {/* Main Text Field - Original (Always disabled in edit mode) */}
      <FormField
        control={form.control}
        name="graphicDesign.mainText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Main Text {isEditMode && '(Original)'}
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter main headline text..." 
                {...field}
                disabled={isEditMode}
                className={isEditMode ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Main Text Updates Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Main Text Updates</label>
          {isEditMode && (
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={addMainTextUpdate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Update
            </Button>
          )}
        </div>

        {mainTextUpdates.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No updates added yet. {isEditMode && 'Click "Add Update" to add new main text.'}
          </p>
        ) : (
          mainTextUpdates.map((item) => (
            <div key={item.index} className="flex gap-2 items-start">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Main Text {item.index} {item.isExisting && '(Previous Update - Read Only)'}
                </label>
                <Textarea
                  placeholder={`Enter updated main text ${item.index}...`}
                  value={item.value}
                  onChange={(e) => updateMainTextValue(item.index, e.target.value)}
                  className={item.isExisting ? "min-h-[80px] bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-300 cursor-not-allowed" : "min-h-[80px]"}
                  disabled={item.isExisting}
                />
              </div>
              {!item.isExisting && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive mt-6"
                  onClick={() => removeMainTextUpdate(item.index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Sub Text Field - Original (Always disabled in edit mode) */}
      <FormField
        control={form.control}
        name="graphicDesign.subText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Sub Text {isEditMode && '(Original)'}
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter supporting text..." 
                {...field}
                disabled={isEditMode}
                className={isEditMode ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sub Text Updates Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Sub Text Updates</label>
          {isEditMode && (
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={addSubTextUpdate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Update
            </Button>
          )}
        </div>

        {subTextUpdates.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No updates added yet. {isEditMode && 'Click "Add Update" to add new sub text.'}
          </p>
        ) : (
          subTextUpdates.map((item) => (
            <div key={item.index} className="flex gap-2 items-start">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Sub Text {item.index} {item.isExisting && '(Previous Update - Read Only)'}
                </label>
                <Textarea
                  placeholder={`Enter updated sub text ${item.index}...`}
                  value={item.value}
                  onChange={(e) => updateSubTextValue(item.index, e.target.value)}
                  className={item.isExisting ? "min-h-[80px] bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-300 cursor-not-allowed" : "min-h-[80px]"}
                  disabled={item.isExisting}
                />
              </div>
              {!item.isExisting && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive mt-6"
                  onClick={() => removeSubTextUpdate(item.index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CTA Text Field */}
        <FormField
          control={form.control}
          name="graphicDesign.ctaText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CTA Text</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Shop Now, Learn More" 
                  {...field}
                  disabled={isEditMode}
                  className={isEditMode ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hashtags Field */}
        <FormField
          control={form.control}
          name="graphicDesign.hashtags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hashtags (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="#example #hashtags" 
                  {...field}
                  disabled={isEditMode}
                  className={isEditMode ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Caption Field */}
        <FormField
          control={form.control}
          name="graphicDesign.caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Data-Driven Decisions" 
                  {...field}
                  disabled={isEditMode}
                  className={isEditMode ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Designer Notes Field */}
      <FormField
        control={form.control}
        name="graphicDesign.designerNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Designer Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add notes for the designer..."
                className={isEditMode ? "min-h-[100px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : "min-h-[100px]"}
                {...field}
                disabled={isEditMode}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}