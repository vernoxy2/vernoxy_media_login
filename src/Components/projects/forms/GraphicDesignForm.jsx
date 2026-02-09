import { useState, useEffect, useCallback, useRef } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Plus, X } from "lucide-react";
import { CiCirclePlus } from "react-icons/ci";

export function GraphicDesignForm({
  form,
  isEditMode = false,
  existingData = null,
  projectId,
}) {
  const [mainTextUpdates, setMainTextUpdates] = useState([]);
  const [subTextUpdates, setSubTextUpdates] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  const postTypes = ["Social Post", "Banner", "Ad", "Poster", "Thumbnail"];
  const platforms = ["Instagram", "Facebook", "LinkedIn", "Website"];
  const sizes = ["Square", "Portrait", "Landscape"];

  const [links, setLinks] = useState([""]);

  // ✅ Update form value whenever links change
  useEffect(() => {
    form.setValue("graphicDesign.link", links);
  }, [links, form]);

  // ✅ Load existing data in edit mode
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

  // ✅ Memoize localStorage key
  const autosaveKeyRef = useRef(null);

  useEffect(() => {
    if (!autosaveKeyRef.current && projectId) {
      autosaveKeyRef.current = `graphicDesign_autosave_${projectId}`;
    }
  }, [projectId]);

  const getLocalStorageKey = useCallback(() => {
    return autosaveKeyRef.current;
  }, []);

  const saveToLocalStorage = useCallback(
    (watchedValues) => {
      // Don't save if we haven't loaded yet or no projectId
      if (!isInitialized || !projectId) return;

      const graphicDesignData = watchedValues?.graphicDesign || {};

      const formData = {
        postType: graphicDesignData.postType || "",
        platform: graphicDesignData.platform || "",
        size: graphicDesignData.size || "",
        mainText: graphicDesignData.mainText || "",
        subText: graphicDesignData.subText || "",
        ctaText: graphicDesignData.ctaText || "",
        hashtags: graphicDesignData.hashtags || "",
        caption: graphicDesignData.caption || "",
        designerNotes: graphicDesignData.designerNotes || "",
      };

      const dataToSave = {
        formData,
        links: links,
        postTypes: postTypes.filter((item) => !item.isExisting),
        mainTextUpdates: mainTextUpdates.filter((item) => !item.isExisting),
        subTextUpdates: subTextUpdates.filter((item) => !item.isExisting),
        timestamp: new Date().toISOString(),
        projectId: projectId,
      };

      const key = getLocalStorageKey();
      localStorage.setItem(key, JSON.stringify(dataToSave));
      console.log("✅ Saved to localStorage:", key, dataToSave);
    },
    [getLocalStorageKey, isInitialized, projectId, links, mainTextUpdates, subTextUpdates],
  );

  // ✅ Load data from localStorage - IMPROVED WITH FORCE RESTORE
  useEffect(() => {
    if (!projectId) {
      console.log("⏳ Waiting for projectId...");
      return;
    }

    // Don't reload if already loaded
    if (hasLoadedFromStorage.current) {
      console.log("ℹ️ Already loaded from storage");
      return;
    }

    const key = getLocalStorageKey();
    const savedData = localStorage.getItem(key);

    console.log("🔍 Loading data for projectId:", projectId);
    console.log("🔍 localStorage key:", key);
    console.log("🔍 savedData:", savedData);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log("📥 Parsed data from localStorage:", parsed);

        // ✅ Force restore after a delay to ensure form is mounted
        setTimeout(() => {
          // ✅ Restore ALL form fields with force update
          if (parsed.formData) {
            console.log("📝 Restoring formData:", parsed.formData);
            
            Object.entries(parsed.formData).forEach(([fieldKey, value]) => {
              const fieldPath = `graphicDesign.${fieldKey}`;
              form.setValue(fieldPath, value, { 
                shouldValidate: false,
                shouldDirty: true
              });
              console.log(`✅ Set ${fieldPath} =`, value);
            });

            // ✅ Force form to re-render
            const currentValues = form.getValues("graphicDesign");
            console.log("🔎 Form values after restore:", currentValues);
          }

          // ✅ Restore links
          if (parsed.links?.length > 0) {
            console.log("🔗 Restoring links:", parsed.links);
            setLinks(parsed.links);
            form.setValue("graphicDesign.link", parsed.links, { 
              shouldValidate: false,
              shouldDirty: true 
            });
          }

          // ✅ Restore main text updates
          if (parsed.mainTextUpdates?.length > 0) {
            console.log("📝 Restoring mainTextUpdates:", parsed.mainTextUpdates);
            setMainTextUpdates(parsed.mainTextUpdates);
            parsed.mainTextUpdates.forEach((item) => {
              form.setValue(`graphicDesign.mainText${item.index}`, item.value, {
                shouldValidate: false,
                shouldDirty: true,
              });
            });
          }

          // ✅ Restore sub text updates
          if (parsed.subTextUpdates?.length > 0) {
            console.log("📝 Restoring subTextUpdates:", parsed.subTextUpdates);
            setSubTextUpdates(parsed.subTextUpdates);
            parsed.subTextUpdates.forEach((item) => {
              form.setValue(`graphicDesign.subText${item.index}`, item.value, {
                shouldValidate: false,
                shouldDirty: true,
              });
            });
          }

          hasLoadedFromStorage.current = true;
          setIsInitialized(true);
          console.log("✅ localStorage restore complete!");
          
        }, 200);

      } catch (error) {
        console.error("❌ Error restoring data:", error);
        hasLoadedFromStorage.current = true;
        setIsInitialized(true);
      }
    } else {
      console.log("ℹ️ No saved data found for key:", key);
      hasLoadedFromStorage.current = true;
      setIsInitialized(true);
    }
  }, [projectId, form, getLocalStorageKey]);

  // ✅ Load existing data in edit mode
  useEffect(() => {
    if (!isEditMode || !existingData) return;
    
    console.log("📝 Edit mode: Loading existing data", existingData);

    // Load existing link data
    if (existingData?.link?.length) {
      setLinks(existingData.link);
      form.setValue("graphicDesign.link", existingData.link);
    }

    // Load existing main text updates
    const existingMainUpdates = [];
    Object.keys(existingData).forEach((key) => {
      if (key.startsWith("mainText") && key !== "mainText") {
        const indexMatch = key.match(/mainText(\d+)/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1]);
          existingMainUpdates.push({
            index,
            value: existingData[key],
            isExisting: true,
          });
          form.setValue(`graphicDesign.mainText${index}`, existingData[key]);
        }
      }
    });
    existingMainUpdates.sort((a, b) => a.index - b.index);
    setMainTextUpdates(existingMainUpdates);

    // Load existing sub text updates
    const existingSubUpdates = [];
    Object.keys(existingData).forEach((key) => {
      if (key.startsWith("subText") && key !== "subText") {
        const indexMatch = key.match(/subText(\d+)/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1]);
          existingSubUpdates.push({
            index,
            value: existingData[key],
            isExisting: true,
          });
          form.setValue(`graphicDesign.subText${index}`, existingData[key]);
        }
      }
    });
    existingSubUpdates.sort((a, b) => a.index - b.index);
    setSubTextUpdates(existingSubUpdates);

    setIsInitialized(true);
    hasLoadedFromStorage.current = true;
    
  }, [isEditMode, existingData, form]);

  // ✅ Watch form changes and auto-save
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = form.watch((value) => {
      saveToLocalStorage(value);
    });

    return () => subscription.unsubscribe();
  }, [form, saveToLocalStorage, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const currentFormValues = form.getValues();
    saveToLocalStorage(currentFormValues);
  }, [links, isInitialized, saveToLocalStorage, form]);

  // ✅ DEBUG: Check form values
  useEffect(() => {
    if (isInitialized) {
      console.log("🔎 Current form values after initialization:");
      console.log("   postType:", form.getValues("graphicDesign.postType"));
      console.log("   platform:", form.getValues("graphicDesign.platform"));
      console.log("   size:", form.getValues("graphicDesign.size"));
      console.log("   mainText:", form.getValues("graphicDesign.mainText"));
      console.log("   subText:", form.getValues("graphicDesign.subText"));
      console.log("   All graphicDesign:", form.getValues("graphicDesign"));
    }
  }, [isInitialized, form]);

  const addMainTextUpdate = () => {
    const highestIndex =
      mainTextUpdates.length > 0
        ? Math.max(...mainTextUpdates.map((item) => item.index))
        : 0;
    const newIndex = highestIndex + 1;
    const newUpdates = [
      ...mainTextUpdates,
      { index: newIndex, value: "", isExisting: false },
    ];
    setMainTextUpdates(newUpdates);
  };

  const addSubTextUpdate = () => {
    const highestIndex =
      subTextUpdates.length > 0
        ? Math.max(...subTextUpdates.map((item) => item.index))
        : 0;
    const newIndex = highestIndex + 1;
    const newUpdates = [
      ...subTextUpdates,
      { index: newIndex, value: "", isExisting: false },
    ];
    setSubTextUpdates(newUpdates);
  };

  const removeMainTextUpdate = (index) => {
    const newUpdates = mainTextUpdates.filter((item) => item.index !== index);
    setMainTextUpdates(newUpdates);
    form.setValue(`graphicDesign.mainText${index}`, undefined);
  };

  const removeSubTextUpdate = (index) => {
    const newUpdates = subTextUpdates.filter((item) => item.index !== index);
    setSubTextUpdates(newUpdates);
    form.setValue(`graphicDesign.subText${index}`, undefined);
  };

  const updateMainTextValue = (index, value) => {
    const newUpdates = mainTextUpdates.map((item) =>
      item.index === index ? { ...item, value } : item,
    );
    setMainTextUpdates(newUpdates);
    form.setValue(`graphicDesign.mainText${index}`, value);
  };

  const updateSubTextValue = (index, value) => {
    const newUpdates = subTextUpdates.map((item) =>
      item.index === index ? { ...item, value } : item,
    );
    setSubTextUpdates(newUpdates);
    form.setValue(`graphicDesign.subText${index}`, value);
  };

  return (
    <div className="space-y-6 rounded-xl border border-service-graphic/20 bg-service-graphic/5 p-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-service-graphic" />
        <h3 className="text-lg font-semibold text-foreground">
          Graphic Design Details
        </h3>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Post Type Field */}
        <FormField
          control={form.control}
          name="graphicDesign.postType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
                defaultValue={field.value}
              >
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
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
                defaultValue={field.value}
              >
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
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
                defaultValue={field.value}
              >
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-3">
        <FormLabel>Reference Links</FormLabel>
        {links.map((link, index) => (
          <div key={index} className="flex items-center gap-2 w-full lg:w-1/2">
            <Input
              placeholder={`Reference Link ${index + 1}`}
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
            />

            {index === links.length - 1 && (
              <CiCirclePlus
                size={28}
                className="flex-shrink-0 cursor-pointer text-gray-600 hover:text-black"
                onClick={addLink}
              />
            )}

            {links.length > 1 && (
              <X
                className="flex-shrink-0 cursor-pointer text-red-600 hover:text-black"
                onClick={() => removeLink(index)}
              />
            )}
          </div>
        ))}

        <FormMessage>
          {form.formState.errors?.graphicDesign?.link?.message}
        </FormMessage>
      </div>

      {/* Main Text Field */}
      <FormField
        control={form.control}
        name="graphicDesign.mainText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Main Text</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter main headline text..."
                {...field}
                value={field.value || ""}
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
            No updates added yet.{" "}
            {isEditMode && 'Click "Add Update" to add new main text.'}
          </p>
        ) : (
          mainTextUpdates.map((item) => (
            <div key={item.index} className="flex gap-2 items-start">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Main Text {item.index}{" "}
                  {item.isExisting && "(Previous Update - Read Only)"}
                </label>
                <Textarea
                  placeholder={`Enter updated main text ${item.index}...`}
                  value={item.value}
                  onChange={(e) =>
                    updateMainTextValue(item.index, e.target.value)
                  }
                  className={
                    item.isExisting
                      ? "min-h-[80px] bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      : "min-h-[80px]"
                  }
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

      {/* Sub Text Field */}
      <FormField
        control={form.control}
        name="graphicDesign.subText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sub Text</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter supporting text..."
                {...field}
                value={field.value || ""}
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
            No updates added yet.{" "}
            {isEditMode && 'Click "Add Update" to add new sub text.'}
          </p>
        ) : (
          subTextUpdates.map((item) => (
            <div key={item.index} className="flex gap-2 items-start">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Sub Text {item.index}{" "}
                  {item.isExisting && "(Previous Update - Read Only)"}
                </label>
                <Textarea
                  placeholder={`Enter updated sub text ${item.index}...`}
                  value={item.value}
                  onChange={(e) =>
                    updateSubTextValue(item.index, e.target.value)
                  }
                  className={
                    item.isExisting
                      ? "min-h-[80px] bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      : "min-h-[80px]"
                  }
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
                  value={field.value || ""}
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
                  value={field.value || ""}
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
                  value={field.value || ""}
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
                className="min-h-[100px]"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export const clearGraphicDesignAutosave = (projectId) => {
  const key = `graphicDesign_autosave_${projectId}`;
  localStorage.removeItem(key);
  console.log("🗑️ Cleared localStorage:", key);
};