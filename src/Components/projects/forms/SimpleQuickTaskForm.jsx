import { useEffect, useState, useRef } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const AUTOSAVE_KEY_PREFIX = "quicktask_autosave_";

export const saveQuickTaskAutosave = (projectId, data) => {
  if (!projectId) return;
  const key = `${AUTOSAVE_KEY_PREFIX}${projectId}`;
  localStorage.setItem(key, JSON.stringify(data));
  console.log("💾 Data saved:", data);
};

export const loadQuickTaskAutosave = (projectId) => {
  if (!projectId) return null;
  const key = `${AUTOSAVE_KEY_PREFIX}${projectId}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
};

export const clearQuickTaskAutosave = (projectId) => {
  if (!projectId) return;
  const key = `${AUTOSAVE_KEY_PREFIX}${projectId}`;
  localStorage.removeItem(key);
  console.log("🗑️ Autosave cleared");
};

export function SimpleQuickTaskForm({ form, projectId, isEditMode, existingData }) {
  const taskType = form.watch("quickTask.taskType");
  const description = form.watch("quickTask.description");
  
  // ✅ Track if data has been loaded
  const hasLoadedData = useRef(false);

  // ✅ STEP 1: Load autosave data FIRST (only once on mount)
  useEffect(() => {
    if (projectId && !isEditMode && !hasLoadedData.current) {
      const savedData = loadQuickTaskAutosave(projectId);
      if (savedData) {
        console.log("📂 Loading autosave:", savedData);
        
        // Load taskType
        if (savedData.taskType) {
          form.setValue("quickTask.taskType", savedData.taskType, {
            shouldValidate: false,
            shouldDirty: false  // Don't mark as dirty during load
          });
        }
        
        // Load description
        if (savedData.description) {
          form.setValue("quickTask.description", savedData.description, {
            shouldValidate: false,
            shouldDirty: false
          });
        }
      }
      hasLoadedData.current = true;  // Mark as loaded
    }
  }, [projectId, isEditMode, form]);

  // ✅ STEP 2: Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && existingData && !hasLoadedData.current) {
      console.log("📝 Loading existing data:", existingData);
      
      if (existingData.taskType) {
        form.setValue("quickTask.taskType", existingData.taskType, {
          shouldValidate: false,
          shouldDirty: true
        });
      }
      
      if (existingData.description) {
        form.setValue("quickTask.description", existingData.description, {
          shouldValidate: false,
          shouldDirty: true
        });
      }
      
      hasLoadedData.current = true;
    }
  }, [isEditMode, existingData, form]);

  // ✅ STEP 3: Autosave - only AFTER data is loaded
  useEffect(() => {
    // Only save if data has been loaded and we're not in edit mode
    if (projectId && !isEditMode && hasLoadedData.current) {
      // Debounce to avoid too many saves
      const timeoutId = setTimeout(() => {
        if (taskType || description) {
          const data = { 
            taskType: taskType || "",  
            description: description || "" 
          };
          saveQuickTaskAutosave(projectId, data);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [taskType, description, projectId, isEditMode]);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-6 text-lg font-semibold text-foreground">
        ⚡Quick Task Details
      </h2>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="quickTask.taskType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Type *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="content_update">Content Update</SelectItem>
                  <SelectItem value="bug_fix">Bug Fix</SelectItem>
                  <SelectItem value="design_tweak">Design Tweak</SelectItem>
                  <SelectItem value="urgent_change">Urgent Change</SelectItem>
                  <SelectItem value="client_request">Client Request</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quickTask.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the quick task in detail..."
                  className="min-h-[150px] resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}