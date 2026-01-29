import { useState, useEffect } from "react";
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
  useEffect(() => {
    form.setValue("graphicDesign.link", links);
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
    setLinks(links.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (isEditMode && existingData?.link?.length) {
      setLinks(existingData.link);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="grid gap-6 md:grid-cols-3 ">
        <FormField
          control={form.control}
          name="websiteDesign.websiteType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
                <Input placeholder="e.g., React, WordPress" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* <FormField
        control={form.control}
        name="websiteDesign.referenceWebsites"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reference Websites</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter URLs of reference websites..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}
      <div className="space-y-3">
        <FormLabel>Reference Links1</FormLabel>
        {links.map((link, index) => (
          <div className="flex items-center gap-2 w-full lg:w-1/2">
            <Input
              placeholder={`Reference Link ${index + 1}`}
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
            />

            {index === links.length - 1 && !isEditMode && (
              <CiCirclePlus
                size={28}
                className="flex-shrink-0 cursor-pointer text-gray-600 hover:text-black"
                onClick={addLink}
              />
            )}

            {links.length > 1 && !isEditMode && (
              <X
                className="flex-shrink-0 cursor-pointer text-red-500"
                onClick={() => removeLink(index)}
              />
            )}
          </div>
        ))}

        <FormMessage>
          {form.formState.errors?.graphicDesign?.link?.message}
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
