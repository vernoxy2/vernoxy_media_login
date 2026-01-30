import { useState, useEffect, useCallback, useRef } from "react";
import { useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../Components/ui/form";
import { Input } from "../../../Components/ui/input";
import { Textarea } from "../../../Components/ui/textarea";
import { Button } from "../../../Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../Components/ui/accordion";
import { Plus, Trash2, X } from "lucide-react";
import { CiCirclePlus } from "react-icons/ci";

export function WebsiteDesignForm({
  form,
  isEditMode = false,
  existingData = null,
  projectId,
}) {
  const {
    fields: pageFields,
    append: appendPage,
    remove: removePage,
  } = useFieldArray({
    control: form.control,
    name: "websiteDesign.pages",
  });

  const [links, setLinks] = useState([""]);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  // ✅ Load links from localStorage when component mounts
  useEffect(() => {
    // Try to get links from localStorage first
    const storedLinks = localStorage.getItem("websiteDesignLinks");

    if (storedLinks) {
      try {
        // If localStorage has links, use them
        const parsedLinks = JSON.parse(storedLinks);
        if (parsedLinks && parsedLinks.length > 0) {
          setLinks(parsedLinks);
          return;
        }
      } catch (error) {
        console.error("Error parsing stored links:", error);
      }
    }

    // Otherwise, check if we're in edit mode with existing data
    if (isEditMode && existingData?.link && existingData.link.length > 0) {
      const validLinks = existingData.link.filter(
        (link) => link && link.trim() !== "",
      );
      if (validLinks.length > 0) {
        setLinks(validLinks);
        // Store in localStorage
        localStorage.setItem("websiteDesignLinks", JSON.stringify(validLinks));
      } else {
        setLinks([""]);
      }
    }
  }, [isEditMode, existingData]);

  // ✅ Update form value AND localStorage whenever links change
  useEffect(() => {
    const filteredLinks = links.filter((link) => link && link.trim() !== "");
    form.setValue("websiteDesign.link", filteredLinks);

    // Save to localStorage
    localStorage.setItem("websiteDesignLinks", JSON.stringify(links));
  }, [links, form]);

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index, value) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };

  const removeLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  // ✅ ADD THIS - Memoize localStorage key
  const getLocalStorageKey = useCallback(() => {
    return `websiteDesign_autosave_${projectId || "new"}`;
  }, [projectId]);

  // ✅ ADD THIS - Save function
  const saveToLocalStorage = useCallback(
    (watchedValues) => {
      if (!isInitialized) return;

      const websiteData = watchedValues?.websiteDesign || {};

      const formData = {
        websiteType: websiteData.websiteType || "",
        numberOfPages: websiteData.numberOfPages || "",
        technologyPreference: websiteData.technologyPreference || "",
        link: (websiteData.link || []).filter((l) => l && l.trim() !== ""),
        pages: websiteData.pages || [],
      };

      const dataToSave = {
        formData,
        timestamp: new Date().toISOString(),
      };

      const key = getLocalStorageKey();
      localStorage.setItem(key, JSON.stringify(dataToSave));
      console.log("✅ Website Design saved to localStorage:", key, dataToSave);
    },
    [getLocalStorageKey, isInitialized],
  );

  // ✅ ADD THIS COMPLETE useEffect
  useEffect(() => {
    if (hasLoadedFromStorage.current || !projectId) return;

    const key = getLocalStorageKey();
    const savedData = localStorage.getItem(key);

    console.log("🔍 Checking Website Design localStorage:", key, savedData);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        if (!isEditMode || !existingData) {
          console.log("📥 Restoring Website Design from localStorage:", parsed);

          setTimeout(() => {
            if (parsed.formData) {
              if (parsed.formData.websiteType) {
                form.setValue(
                  "websiteDesign.websiteType",
                  parsed.formData.websiteType,
                  {
                    shouldValidate: false,
                    shouldDirty: false,
                  },
                );
              }
              if (parsed.formData.numberOfPages) {
                form.setValue(
                  "websiteDesign.numberOfPages",
                  parsed.formData.numberOfPages,
                  {
                    shouldValidate: false,
                    shouldDirty: false,
                  },
                );
              }
              if (parsed.formData.technologyPreference) {
                form.setValue(
                  "websiteDesign.technologyPreference",
                  parsed.formData.technologyPreference,
                  {
                    shouldValidate: false,
                    shouldDirty: false,
                  },
                );
              }
              if (parsed.formData.link && parsed.formData.link.length > 0) {
                setLinks(parsed.formData.link);
                form.setValue("websiteDesign.link", parsed.formData.link, {
                  shouldValidate: false,
                  shouldDirty: false,
                });
              }
              if (parsed.formData.pages && parsed.formData.pages.length > 0) {
                form.setValue("websiteDesign.pages", parsed.formData.pages, {
                  shouldValidate: false,
                  shouldDirty: false,
                });
              }
            }

            hasLoadedFromStorage.current = true;
            setIsInitialized(true);
          }, 100);
        } else {
          hasLoadedFromStorage.current = true;
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("❌ Error loading Website Design autosaved data:", error);
        hasLoadedFromStorage.current = true;
        setIsInitialized(true);
      }
    } else {
      console.log("ℹ️ No Website Design saved data found");
      hasLoadedFromStorage.current = true;
      setIsInitialized(true);
    }
  }, [projectId, isEditMode, existingData, form, getLocalStorageKey]);

  // ✅ ADD THIS - Watch and auto-save
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = form.watch((value) => {
      saveToLocalStorage(value);
    });

    return () => subscription.unsubscribe();
  }, [form, saveToLocalStorage, isInitialized]);

  const addPage = () => {
    appendPage({
      pageName: "",
      pagePurpose: "",
      sections: [],
    });
  };

  const websiteTypes = [
    "Corporate",
    "E-commerce",
    "Portfolio",
    "Landing Page",
    "Web App",
  ];
  const pageCounts = ["1-5", "6-10", "10+"];
  const sectionTypes = [
    "Hero",
    "About",
    "Services",
    "CTA",
    "Testimonials",
    "Footer",
  ];

  return (
    <div className="space-y-6 rounded-xl border border-service-website/20 bg-service-website/5 p-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-service-website" />
        <h3 className="text-lg font-semibold text-foreground">
          Website Design Details
        </h3>
      </div>

      {/* Website Basics */}
      <div className="grid gap-6 md:grid-cols-3">
        <FormField
          control={form.control}
          name="websiteDesign.websiteType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {websiteTypes.map((type) => (
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
          name="websiteDesign.numberOfPages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Pages</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pageCounts.map((count) => (
                    <SelectItem key={count} value={count}>
                      {count}
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
          name="websiteDesign.technologyPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technology Preference</FormLabel>
              <FormControl>
                <Input placeholder="e.g., React, WordPress" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Reference Links */}
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
                className="flex-shrink-0 cursor-pointer text-red-500"
                onClick={() => removeLink(index)}
              />
            )}
          </div>
        ))}

        <FormMessage>
          {form.formState.errors?.websiteDesign?.link?.message}
        </FormMessage>
      </div>

      {/* Page Structure */}
      <div className="border-t border-border pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">
            Page-wise Structure
          </h4>
          <Button type="button" variant="outline" size="sm" onClick={addPage}>
            <Plus className="mr-1 h-4 w-4" />
            Add Page
          </Button>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {pageFields.map((page, pageIndex) => (
            <AccordionItem
              key={page.id}
              value={`page-${pageIndex}`}
              className="rounded-lg border border-border bg-card"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {form.watch(`websiteDesign.pages.${pageIndex}.pageName`) ||
                      `Page ${pageIndex + 1}`}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`websiteDesign.pages.${pageIndex}.pageName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Home, About" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`websiteDesign.pages.${pageIndex}.pagePurpose`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Purpose</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Main purpose of this page"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <PageSections
                    form={form}
                    pageIndex={pageIndex}
                    sectionTypes={sectionTypes}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removePage(pageIndex)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove Page
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function PageSections({ form, pageIndex, sectionTypes }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `websiteDesign.pages.${pageIndex}.sections`,
  });

  const addSection = () => {
    append({
      sectionType: "",
      mainHeading: "",
      subHeading: "",
      paragraphText: "",
      buttonText: "",
      buttonLink: "",
      layoutNotes: "",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-muted-foreground">Sections</h5>
        <Button type="button" variant="ghost" size="sm" onClick={addSection}>
          <Plus className="mr-1 h-3 w-3" />
          Add Section
        </Button>
      </div>

      {fields.map((section, sectionIndex) => (
        <div
          key={section.id}
          className="rounded-lg border border-border/50 bg-muted/30 p-4"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name={`websiteDesign.pages.${pageIndex}.sections.${sectionIndex}.sectionType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Section Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sectionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`websiteDesign.pages.${pageIndex}.sections.${sectionIndex}.mainHeading`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Main Heading</FormLabel>
                  <FormControl>
                    <Input className="h-8" placeholder="Heading" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`websiteDesign.pages.${pageIndex}.sections.${sectionIndex}.subHeading`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Sub Heading</FormLabel>
                  <FormControl>
                    <Input
                      className="h-8"
                      placeholder="Sub heading"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`websiteDesign.pages.${pageIndex}.sections.${sectionIndex}.buttonText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Button Text</FormLabel>
                  <FormControl>
                    <Input className="h-8" placeholder="CTA text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => remove(sectionIndex)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
// ✅ ADD THIS at the end of file (after PageSections function)
export const clearWebsiteDesignAutosave = (projectId) => {
  const key = `websiteDesign_autosave_${projectId || 'new'}`;
  localStorage.removeItem(key);
  console.log('🗑️ Cleared Website Design autosave:', key);
};